using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;
using Supabase.Postgrest;
using Client = Supabase.Client;

namespace badgeur_backend.Services
{
    public class AnnouncementService
    {
        private readonly Client _client;
        private readonly UserService _userService;

        public AnnouncementService(Client client, UserService userService)
        {
            _client = client;
            _userService = userService;
        }

        public async Task<long> CreateAnnouncementAsync(CreateAnnouncementRequest request)
        {
            var announcement = new Announcement
            {
                Title = request.Title,
                Message = request.Message,
                AuthorId = request.AuthorId,
                CreatedAt = DateTime.UtcNow
            };

            var response = await _client.From<Announcement>().Insert(announcement);
            return response.Models.First().Id;
        }

        public async Task<List<AnnouncementResponse>> GetAllAnnouncementsAsync()
        {
            var response = await _client.From<Announcement>()
                .Order(n => n.CreatedAt, Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            var announcements = response.Models;
            var result = new List<AnnouncementResponse>();

            foreach (var announcement in announcements)
            {
                var author = await _userService.GetUserByIdAsync(announcement.AuthorId);
                result.Add(CreateAnnouncementResponse(announcement, author));
            }

            return result;
        }

        public async Task<AnnouncementResponse?> GetAnnouncementByIdAsync(long id)
        {
            var response = await _client.From<Announcement>().Where(n => n.Id == id).Get();
            var announcement = response.Models.FirstOrDefault();

            if (announcement == null) return null;

            var author = await _userService.GetUserByIdAsync(announcement.AuthorId);
            return CreateAnnouncementResponse(announcement, author);
        }

        public async Task<AnnouncementResponse?> UpdateAnnouncementAsync(long id, UpdateAnnouncementRequest request)
        {
            var query = await _client.From<Announcement>().Where(n => n.Id == id).Get();
            var announcement = query.Models.FirstOrDefault();

            if (announcement == null) return null;

            if (!string.IsNullOrEmpty(request.Title))
            {
                announcement.Title = request.Title;
            }

            if (!string.IsNullOrEmpty(request.Message))
            {
                announcement.Message = request.Message;
            }

            await _client.From<Announcement>().Update(announcement);

            var author = await _userService.GetUserByIdAsync(announcement.AuthorId);
            return CreateAnnouncementResponse(announcement, author);
        }

        public async Task DeleteAnnouncementAsync(long id)
        {
            await _client.From<Announcement>().Where(n => n.Id == id).Delete();
        }

        private AnnouncementResponse CreateAnnouncementResponse(Announcement announcement, UserResponse? author)
        {
            return new AnnouncementResponse
            {
                Id = announcement.Id,
                Title = announcement.Title,
                Message = announcement.Message,
                AuthorId = announcement.AuthorId,
                AuthorFirstName = author?.FirstName ?? string.Empty,
                AuthorLastName = author?.LastName ?? string.Empty,
                CreatedAt = announcement.CreatedAt
            };
        }
    }
}

