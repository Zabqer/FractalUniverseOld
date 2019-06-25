from django.core.management.base import BaseCommand

from ...utils import task_manager

class Command(BaseCommand):
    help = "Run queued draw tasks"
    def handle(self, *args, **options):
        task_manager.perform_tasks()
