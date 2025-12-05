from django.urls import path
from . import utils
from . import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('check_premium', utils.check_premium, name='check_premium'),
    path('get_learner_quota', utils.get_learner_quota, name='get_learner_quota'),
    path('reset_quota/', utils.reset_quota, name='reset_quota'),
    path('activate/<uuid:token>/', views.activate_learner, name='activate-learner'),
    path('forgot_password/', views.forgot_password, name='forgot-password'),
    path('reset_password/', views.reset_password, name='reset-password'),
    
    # learner profile
    path('save-or-update-learner-profile/', views.save_or_update_learner_profile, name='save_or_update_learner_profile'),
]