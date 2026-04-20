from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Category, Expense, Income, Goal



class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    first_name = serializers.CharField(max_length=50, required=False, default='')
    last_name = serializers.CharField(max_length=50, required=False, default='')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("Account is disabled.")
        data['user'] = user
        return data


class StatsSerializer(serializers.Serializer):
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense_by_category = serializers.ListField()
    weekly_expenses = serializers.ListField()
    monthly_expenses = serializers.ListField()
    recent_expenses = serializers.ListField()
    goal_progress = serializers.ListField()



class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color', 'is_default', 'created_at']
        read_only_fields = ['id', 'is_default', 'created_at']


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    category_icon = serializers.SerializerMethodField()
    category_color = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'date', 'note',
            'category', 'category_name', 'category_icon', 'category_color',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else 'Uncategorized'

    def get_category_icon(self, obj):
        return obj.category.icon if obj.category else '💰'

    def get_category_color(self, obj):
        return obj.category.color if obj.category else '#6366f1'


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'title', 'amount', 'source', 'date', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']


class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Goal
        fields = [
            'id', 'title', 'target_amount', 'current_amount',
            'deadline', 'description', 'is_completed',
            'progress_percentage', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'is_completed', 'progress_percentage', 'created_at', 'updated_at']
