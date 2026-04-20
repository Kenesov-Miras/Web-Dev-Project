from django.db import models
from django.contrib.auth.models import User


class ActiveManager(models.Manager):
    """Custom manager that returns only active (non-deleted) records."""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class Category(models.Model):
    ICON_CHOICES = [
        ('🍔', 'Food'),
        ('🚌', 'Transport'),
        ('✈️', 'Travel'),
        ('💊', 'Health'),
        ('🛍️', 'Shopping'),
        ('📚', 'Education'),
        ('💡', 'Bills'),
        ('🎬', 'Entertainment'),
        ('💰', 'Other'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, default='💰')
    color = models.CharField(max_length=7, default='#6366f1')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'name')
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='expenses')
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    note = models.TextField(blank=True, default='')
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    active = ActiveManager()

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.user.username})"

    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.save()


class Income(models.Model):
    SOURCE_CHOICES = [
        ('salary', 'Salary'),
        ('freelance', 'Freelance'),
        ('business', 'Business'),
        ('investment', 'Investment'),
        ('gift', 'Gift'),
        ('other', 'Other'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='salary')
    date = models.DateField()
    note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.user.username})"


class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, default='')
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    @property
    def progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return min(100, round(float(self.current_amount) / float(self.target_amount) * 100, 1))
