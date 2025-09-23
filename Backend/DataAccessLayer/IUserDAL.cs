using Backend.Models;

namespace Backend.DataAccessLayer
{
    public interface IUserDAL
    {
        Task<User> GetUserByUsernameAsync(string username);
        Task AddUserAsync(User user);
        Task<User?> ValidateUserAsync(string username, string password);
    }
}
