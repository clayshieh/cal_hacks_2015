from django.conf.urls import patterns, include, url
from django.contrib import admin
from cal_hacks import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'cal_hacks.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', views.launch, name='launch'),
    url(r'^maps/', include('maps.urls')),
)+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
