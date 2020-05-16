from django.urls import path, re_path
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, UserViewSet, FileViewSet
from django.conf.urls import url, include
from rest_framework_swagger.views import get_swagger_view
from rest_framework.schemas import get_schema_view
from rest_framework_swagger.renderers import SwaggerUIRenderer, OpenAPIRenderer
from django.views.generic.base import RedirectView

# from . import views
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'files', FileViewSet)
favicon_view = RedirectView.as_view(url='/static/image/favicon.ico', permanent=True)


# swagger_view = get_swagger_view(title='rememberAll API')
schema_view = get_schema_view(title='RememberAll API', renderer_classes=[SwaggerUIRenderer, OpenAPIRenderer])
urlpatterns = [
    path('', include(router.urls)),
    # path('\', get_swagger_view(title="API"))
    path('favicon.ico', favicon_view),
    path('api/', schema_view, name='api'),
    path('api-auth/', include('rest_framework.urls')),
    # path('upload/', FileView.as_view(), name='file-upload'),
]