using Backend.Models;

namespace Backend.BusinessLayer
{
    public interface IUserBL
    {
        Task<User> RegisterAsync(string username, string password);
        Task<string> LoginAsync(string username, string password);
    }
}
