from django.shortcuts import render


def home(request):
    """
    Landing page of GlobeTrotter.
    Phase 1: static welcome page.
    Phase 2+: will show login/signup or dashboard link based on auth state.
    """
    context = {
        'app_name': 'GlobeTrotter',
        'tagline': 'Empowering Personalized Travel Planning',
    }
    return render(request, 'home.html', context)
