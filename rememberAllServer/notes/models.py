from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import User
import sys


class Note(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=20, blank=True)
    time = models.DateTimeField(default=now)
    noteType = models.CharField(max_length=10, blank=True)
    noteContent = models.CharField(max_length=sys.maxsize, default='[]')
    noteSkeleton = models.CharField(max_length=sys.maxsize, default='[]')
    user = models.ForeignKey(User, related_name='notes', on_delete=models.CASCADE)


class MyFile(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    file = models.FileField(blank=False, null=False)
    note = models.ForeignKey(Note, related_name='files', on_delete=models.CASCADE)
