const { UserRepository } = require('/home/admin1/sso-backend/repositories/user.repository');
const userRepo = new UserRepository();
userRepo.findByUsername('dsp@wisdomvast.com').then(user => {
  console.log('User found:', user);
}).catch(err => {
  console.error('Error:', err);
});
