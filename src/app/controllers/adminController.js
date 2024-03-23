const userRepository = require("../repositories/userRepository");

class AdminController {
	// Listar todos os usuários
	async user(request, response) {
		const users = await userRepository.findAll();

		response.json(users);
	}

	async show(request, response) {
		const { cpf } = request.params;

		const user = await userRepository.findByCPF(cpf);

		if (!user) {
			// 404: Não encontrado
			return response.status(404).json({ error: "Usuario não encontrado " });
		}

		response.json(user);
	}

	// Deletar usuário
	async delete(request, response) {
		const { cpf } = request.params;

		const user = await userRepository.findByCPF(cpf);

		if (!user) {
			// 404: Sem conteúdo
			return response.status(404).json({ error: "Usuário não encontrado." });
		}

		await userRepository.delete(cpf);
		response.sendStatus(204);
	}
}

module.exports = new AdminController();
