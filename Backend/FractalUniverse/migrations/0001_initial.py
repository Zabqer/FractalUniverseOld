# Generated by Django 2.1.7 on 2019-03-15 16:18

import FractalUniverse.managers
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0009_alter_user_last_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Token',
            fields=[
                ('key', models.CharField(max_length=40, primary_key=True, serialize=False, verbose_name='key')),
                ('remember', models.BooleanField(default=True, verbose_name='remember')),
                ('created', models.DateTimeField(auto_now_add=True, verbose_name='created')),
                ('expire_at', models.DateTimeField(default=None, verbose_name='expire_at')),
            ],
            options={
                'verbose_name': 'token',
                'verbose_name_plural': 'tokens',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('login', models.CharField(max_length=32, unique=True, verbose_name='login')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='email')),
                ('password', models.CharField(max_length=256, verbose_name='password')),
                ('date_joined', models.DateTimeField(auto_now_add=True, verbose_name='registered')),
                ('is_active', models.BooleanField(default=True, verbose_name='is_active')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.Group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.Permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'managed': True,
            },
            managers=[
                ('objects', FractalUniverse.managers.UserManager()),
            ],
        ),
        migrations.AddField(
            model_name='token',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='auth_tokens', to=settings.AUTH_USER_MODEL, verbose_name='user'),
        ),
    ]