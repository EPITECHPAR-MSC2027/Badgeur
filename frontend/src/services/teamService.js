import authService from './authService'

export default {
    async listTeams() {
        const res = await authService.get('/teams')
        if (!res.ok) return []
        return res.json()
    },
    async listUsers() {
        const res = await authService.get('/users')
        if (!res.ok) return []
        return res.json()
    },
    async listMyTeamMembers() {
        const [users, teams] = await Promise.all([this.listUsers(), this.listTeams()])
        const currentUserId = parseInt(localStorage.getItem('userId'))
        const me = Array.isArray(users) ? users.find(u => u.id === currentUserId) : null

        // Try resolve team in two ways:
        // 1) If I'm the manager of a team
        // 2) If I belong to a team via teamId
        let myTeam = null
        if (Array.isArray(teams)) {
            myTeam = teams.find(t => t.managerId === currentUserId) || (me ? teams.find(t => t.id === (me.teamId || 0)) : null)
        }

        if (!myTeam) {
            // No team found: return me only if present
            return me ? [me] : []
        }

        const members = Array.isArray(users) ? users.filter(u => (u.teamId || 0) === myTeam.id) : []

        // Ensure the manager is present even if they don't have teamId set
        const managerUser = users.find(u => u.id === myTeam.managerId)
        if (managerUser && !members.some(u => u.id === managerUser.id)) {
            members.unshift(managerUser)
        }

        return members
    }
}


