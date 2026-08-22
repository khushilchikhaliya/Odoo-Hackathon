from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_view, name='dashboard'),

    # Trip management
    path('trip/create/', views.create_trip_view, name='create_trip'),
    path('trips/', views.my_trips_view, name='my_trips'),
    path('trip/<int:trip_id>/', views.trip_detail_view, name='trip_detail'),
    path('trip/<int:trip_id>/edit/', views.edit_trip_view, name='edit_trip'),
    path('trip/<int:trip_id>/delete/', views.delete_trip_view, name='delete_trip'),
]
