from django.core.management.base import BaseCommand

from ...models import User

class Command(BaseCommand):
    help = "Makes admin user"
    def handle(self, *args, **options):
        print("Login: ", end="")
        login = input()
        print("Email [default admin@localhost]: ", end="")
        email = input()
        if len(email) == 0:
            email = "admin@localhost"
        print("Password: ", end="")
        password = input()
        user = User.objects.create(
            login=login,
            email=email,
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        user.set_password(password)
        user.save()
