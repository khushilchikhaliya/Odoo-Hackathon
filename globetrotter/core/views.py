from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login as auth_login, logout as auth_logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from .forms import SignupForm, LoginForm, TripForm
from .models import Trip


def home(request):
    """Landing page of GlobeTrotter."""
    context = {
        'app_name': 'GlobeTrotter',
        'tagline': 'Empowering Personalized Travel Planning',
    }
    return render(request, 'home.html', context)


def signup_view(request):
    """Handles new user registration."""
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            messages.success(request, f'Welcome to GlobeTrotter, {user.username}!')
            return redirect('dashboard')
    else:
        form = SignupForm()

    return render(request, 'signup.html', {'form': form})


def login_view(request):
    """Handles user login using Django's session auth system."""
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                auth_login(request, user)
                messages.success(request, f'Welcome back, {user.username}!')
                return redirect('dashboard')
            else:
                messages.error(request, 'Invalid username or password.')
    else:
        form = LoginForm()

    return render(request, 'login.html', {'form': form})


def logout_view(request):
    """Logs the user out and redirects to homepage."""
    auth_logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('home')


@login_required
def dashboard_view(request):
    """
    Central hub for a logged-in user.
    Phase 3: shows real trips pulled from the database (max 3 most recent).
    """
    trips = Trip.objects.filter(user=request.user)[:3]
    trip_count = Trip.objects.filter(user=request.user).count()
    context = {
        'user': request.user,
        'trips': trips,
        'trip_count': trip_count,
    }
    return render(request, 'dashboard.html', context)


@login_required
def create_trip_view(request):
    """
    Create a new trip.
    GET  -> show blank form
    POST -> validate + save to database, linked to the logged-in user
    """
    if request.method == 'POST':
        form = TripForm(request.POST, request.FILES)
        if form.is_valid():
            trip = form.save(commit=False)
            trip.user = request.user
            trip.save()
            messages.success(request, f'Trip "{trip.name}" created successfully!')
            return redirect('my_trips')
    else:
        form = TripForm()

    return render(request, 'create_trip.html', {'form': form, 'editing': False})


@login_required
def my_trips_view(request):
    """List all trips belonging to the logged-in user, from the database."""
    trips = Trip.objects.filter(user=request.user)
    return render(request, 'my_trips.html', {'trips': trips})


@login_required
def trip_detail_view(request, trip_id):
    """
    Show details of a single trip.
    get_object_or_404 with user=request.user ensures a user can
    only view their OWN trips (not someone else's by guessing the ID).
    """
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    return render(request, 'trip_detail.html', {'trip': trip})


@login_required
def edit_trip_view(request, trip_id):
    """Edit an existing trip that belongs to the logged-in user."""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)

    if request.method == 'POST':
        form = TripForm(request.POST, request.FILES, instance=trip)
        if form.is_valid():
            form.save()
            messages.success(request, 'Trip updated successfully.')
            return redirect('trip_detail', trip_id=trip.id)
    else:
        form = TripForm(instance=trip)

    return render(request, 'create_trip.html', {'form': form, 'editing': True, 'trip': trip})


@login_required
def delete_trip_view(request, trip_id):
    """Delete a trip after confirmation."""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)

    if request.method == 'POST':
        trip_name = trip.name
        trip.delete()
        messages.info(request, f'Trip "{trip_name}" was deleted.')
        return redirect('my_trips')

    return render(request, 'trip_confirm_delete.html', {'trip': trip})
