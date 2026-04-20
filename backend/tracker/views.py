from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Expense, Income, Goal
from .serializers import (
    RegisterSerializer, LoginSerializer,
    CategorySerializer, ExpenseSerializer,
    IncomeSerializer, GoalSerializer,
)



@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_view(request):
    user = request.user
    today = date.today()

    total_income = Income.objects.filter(user=user).aggregate(
        total=Sum('amount'))['total'] or Decimal('0')
    total_expense = Expense.active.filter(user=user).aggregate(
        total=Sum('amount'))['total'] or Decimal('0')
    balance = total_income - total_expense

    category_data = (
        Expense.active.filter(user=user)
        .values('category__name', 'category__color', 'category__icon')
        .annotate(total=Sum('amount'))
        .order_by('-total')
    )
    expense_by_category = [
        {
            'name': item['category__name'] or 'Uncategorized',
            'color': item['category__color'] or '#6366f1',
            'icon': item['category__icon'] or '💰',
            'total': float(item['total']),
        }
        for item in category_data
    ]

    weekly = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        total = Expense.active.filter(user=user, date=day).aggregate(
            total=Sum('amount'))['total'] or Decimal('0')
        weekly.append({
            'day': day.strftime('%a'),
            'date': day.isoformat(),
            'total': float(total),
        })

    monthly = []
    for i in range(29, -1, -1):
        day = today - timedelta(days=i)
        total = Expense.active.filter(user=user, date=day).aggregate(
            total=Sum('amount'))['total'] or Decimal('0')
        monthly.append({
            'day': day.strftime('%b %d'),
            'date': day.isoformat(),
            'total': float(total),
        })

    recent = Expense.active.filter(user=user).select_related('category')[:5]
    recent_expenses = ExpenseSerializer(recent, many=True).data

    goals = Goal.objects.filter(user=user, is_completed=False)
    goal_progress = [
        {
            'id': g.id,
            'title': g.title,
            'target': float(g.target_amount),
            'current': float(g.current_amount),
            'progress': g.progress_percentage,
        }
        for g in goals
    ]

    return Response({
        'total_income': float(total_income),
        'total_expense': float(total_expense),
        'balance': float(balance),
        'expense_by_category': expense_by_category,
        'weekly_expenses': weekly,
        'monthly_expenses': monthly,
        'recent_expenses': recent_expenses,
        'goal_progress': goal_progress,
    })



class CategoryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.active.filter(user=request.user).select_related('category')

        search = request.query_params.get('search', '')
        category_id = request.query_params.get('category', '')
        date_from = request.query_params.get('date_from', '')
        date_to = request.query_params.get('date_to', '')
        min_amount = request.query_params.get('min_amount', '')

        if search:
            expenses = expenses.filter(title__icontains=search)
        if category_id:
            expenses = expenses.filter(category_id=category_id)
        if date_from:
            expenses = expenses.filter(date__gte=date_from)
        if date_to:
            expenses = expenses.filter(date__lte=date_to)
        if min_amount:
            try:
                expenses = expenses.filter(amount__gte=Decimal(min_amount))
            except Exception:
                pass

        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Expense.active.get(pk=pk, user=user)
        except Expense.DoesNotExist:
            return None

    def get(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ExpenseSerializer(expense).data)

    def put(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        expense.delete()
        return Response({'message': 'Expense deleted.'}, status=status.HTTP_204_NO_CONTENT)


class IncomeListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        incomes = Income.objects.filter(user=request.user)
        serializer = IncomeSerializer(incomes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = IncomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoalListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        goals = Goal.objects.filter(user=request.user)
        serializer = GoalSerializer(goals, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
