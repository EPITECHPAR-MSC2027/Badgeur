using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class NotificationService
    {
        private readonly Client _client;

        public NotificationService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreateNotificationAsync(CreateNotificationRequest request)
        {
            var notification = new Notification
            {
                UserId = request.UserId,
                Message = request.Message,
                Type = request.Type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                RelatedId = request.RelatedId
            };

            var response = await _client.From<Notification>().Insert(notification);
            return response.Models.First().Id;
        }

        public async Task<List<NotificationResponse>> GetNotificationsByUserIdAsync(long userId)
        {
            var response = await _client.From<Notification>()
                .Where(n => n.UserId == userId)
                .Order(n => n.CreatedAt, Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models.Select(CreateNotificationResponse).ToList();
        }

        public async Task<List<NotificationResponse>> GetUnreadNotificationsByUserIdAsync(long userId)
        {
            var response = await _client.From<Notification>()
                .Where(n => n.UserId == userId && n.IsRead == false)
                .Order(n => n.CreatedAt, Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models.Select(CreateNotificationResponse).ToList();
        }

        public async Task<NotificationResponse?> GetNotificationByIdAsync(long id)
        {
            var response = await _client.From<Notification>().Where(n => n.Id == id).Get();
            var notification = response.Models.FirstOrDefault();

            if (notification == null) return null;
            return CreateNotificationResponse(notification);
        }

        public async Task<NotificationResponse?> UpdateNotificationAsync(long id, UpdateNotificationRequest request)
        {
            var query = await _client.From<Notification>().Where(n => n.Id == id).Get();
            var notification = query.Models.FirstOrDefault();

            if (notification == null) return null;

            if (request.IsRead.HasValue)
            {
                notification.IsRead = request.IsRead.Value;
            }

            await _client.From<Notification>().Update(notification);
            return CreateNotificationResponse(notification);
        }

        public async Task MarkAllAsReadAsync(long userId)
        {
            var response = await _client.From<Notification>()
                .Where(n => n.UserId == userId && n.IsRead == false)
                .Get();

            var notifications = response.Models;
            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            if (notifications.Any())
            {
                await _client.From<Notification>().Update(notifications);
            }
        }

        public async Task DeleteNotificationAsync(long id)
        {
            await _client.From<Notification>().Where(n => n.Id == id).Delete();
        }

        private NotificationResponse CreateNotificationResponse(Notification notification)
        {
            return new NotificationResponse
            {
                Id = notification.Id,
                UserId = notification.UserId,
                Message = notification.Message,
                Type = notification.Type,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                RelatedId = notification.RelatedId
            };
        }
    }
}

