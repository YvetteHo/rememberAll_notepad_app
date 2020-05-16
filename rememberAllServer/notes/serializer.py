from rest_framework import serializers
from .models import Note, MyFile
from django.contrib.auth.models import User


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ('id', 'name', 'time', 'noteType', 'noteContent', 'noteSkeleton', 'user')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyFile
        fields = ('id', 'file', 'note')

