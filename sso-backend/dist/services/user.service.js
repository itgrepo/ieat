"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const identity_mapping_repository_1 = require("../repositories/identity-mapping.repository");
const uuid_1 = require("uuid");
class UserService {
    constructor() {
        this.userRepo = new user_repository_1.UserRepository();
        this.mappingRepo = new identity_mapping_repository_1.IdentityMappingRepository();
    }
    async provisionUser(profile, providerId, externalId) {
        // 1. Check if we have an existing mapping for this IDP + External ID
        let mapping = await this.mappingRepo.findByExternalId(providerId, externalId);
        let user;
        if (mapping) {
            // User has logged in with this IDP before
            user = await this.userRepo.getById(mapping.userId);
        }
        // 2. If no mapping, try to link by email (optional, for safety we check it)
        if (!user && profile.email) {
            user = await this.userRepo.findByEmail(profile.email);
        }
        // 3. Create user if they don't exist
        if (!user) {
            user = {
                id: (0, uuid_1.v4)(),
                username: profile.username || profile.email?.split('@')[0] || `user_${Date.now()}`,
                email: profile.email || '',
                fullName: profile.fullName || '',
                department: profile.department || 'General',
                role: profile.role || 'User',
                status: 'active'
            };
            await this.userRepo.create(user);
            console.log(`[UserService] Created new user: ${user.email} (${user.id})`);
        }
        else {
            // Update existing user profile with latest data from IDP
            const updates = {};
            if (profile.fullName && profile.fullName !== user.fullName)
                updates.fullName = profile.fullName;
            if (profile.department && profile.department !== user.department)
                updates.department = profile.department;
            if (Object.keys(updates).length > 0) {
                await this.userRepo.update(user.id, updates);
                user = { ...user, ...updates };
                console.log(`[UserService] Updated profile for user: ${user.email}`);
            }
        }
        // 4. Ensure identity mapping exists and is up to date
        if (!mapping) {
            const newMapping = {
                id: (0, uuid_1.v4)(),
                userId: user.id,
                providerId: providerId,
                externalId: externalId,
                providerType: 'saml',
                lastLogin: new Date()
            };
            await this.mappingRepo.create(newMapping);
            mapping = newMapping;
        }
        else {
            await this.mappingRepo.update(mapping.id, { lastLogin: new Date() });
        }
        return user;
    }
}
exports.UserService = UserService;
