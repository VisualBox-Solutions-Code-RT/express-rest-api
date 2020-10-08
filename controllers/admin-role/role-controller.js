const roleRepo = require('../../data/repos/role-repo')

module.exports = {
    getRoles: async (req, res) => {
        res.status(200).json(await roleRepo.getRoles())
    },
    postAppRole: async (req, res) => {
        const { name } = req.body
        const { roleId } = await roleRepo.insertUpdateAppRole({ id: null, name })

        res.status(201).json({ id: roleId, name })
    },
    putAppRole: async (req, res) => {
        const { id, name } = req.body
        const { roleId } = await roleRepo.insertUpdateAppRole({ id, name })

        res.status(200).json({ id: roleId, name })
    },
    deleteAppRole: async (req, res) => {
        const { id } = req.params
        await roleRepo.deleteAppRole(id)

        res.status(200).json({ deleted: true })
    }
}