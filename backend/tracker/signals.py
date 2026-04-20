from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Category

DEFAULT_CATEGORIES = [
    {'name': 'Food', 'icon': '🍔', 'color': '#f97316'},
    {'name': 'Transport', 'icon': '🚌', 'color': '#3b82f6'},
    {'name': 'Travel', 'icon': '✈️', 'color': '#06b6d4'},
    {'name': 'Health', 'icon': '💊', 'color': '#10b981'},
    {'name': 'Shopping', 'icon': '🛍️', 'color': '#ec4899'},
    {'name': 'Education', 'icon': '📚', 'color': '#8b5cf6'},
    {'name': 'Bills', 'icon': '💡', 'color': '#f59e0b'},
    {'name': 'Entertainment', 'icon': '🎬', 'color': '#6366f1'},
]


@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        for cat in DEFAULT_CATEGORIES:
            Category.objects.create(
                user=instance,
                name=cat['name'],
                icon=cat['icon'],
                color=cat['color'],
                is_default=True,
            )
