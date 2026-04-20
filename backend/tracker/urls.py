from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('stats/', views.stats_view, name='stats'),
    path('categories/', views.CategoryListCreateView.as_view(), name='categories'),
    path('expenses/', views.ExpenseListCreateView.as_view(), name='expenses'),
    path('expenses/<int:pk>/', views.ExpenseDetailView.as_view(), name='expense-detail'),
    path('incomes/', views.IncomeListCreateView.as_view(), name='incomes'),
    path('goals/', views.GoalListCreateView.as_view(), name='goals'),
]
