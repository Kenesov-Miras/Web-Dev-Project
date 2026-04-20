from django.contrib import admin
from .models import Category, Expense, Income, Goal


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color', 'user', 'is_default', 'created_at']
    list_filter = ['is_default', 'created_at']
    search_fields = ['name', 'user__username']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['title', 'amount', 'category', 'user', 'date', 'is_deleted']
    list_filter = ['is_deleted', 'date', 'category']
    search_fields = ['title', 'user__username']
    date_hierarchy = 'date'


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['title', 'amount', 'source', 'user', 'date']
    list_filter = ['source', 'date']
    search_fields = ['title', 'user__username']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['title', 'target_amount', 'current_amount', 'user', 'is_completed']
    list_filter = ['is_completed']
    search_fields = ['title', 'user__username']
