<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\Alertas;
use App\Entity\Fincas;
use App\Entity\User;
#[Route('/api', name: 'api_')]
class AlertasController extends AbstractController
{
    #[Route('/alertas', name: 'alertas_index', methods: ['get'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        if ($user->isAdmin()) {
            // Admin puede ver todas las alertas
            $alertas = $entityManager
                ->getRepository(Alertas::class)
                ->findAll();
        } else {
            // Obtener todas las fincas del usuario
            $fincas = $entityManager
                ->getRepository(Fincas::class)
                ->findBy(['user' => $user]);

            $fincaIds = array_map(fn($finca) => $finca->getId(), $fincas);

            if (empty($fincaIds)) {
                return $this->json([]);
            }

            // Obtener alertas de esas fincas
            $alertas = $entityManager
                ->getRepository(Alertas::class)
                ->createQueryBuilder('a')
                ->where('a.finca IN (:fincaIds)')
                ->setParameter('fincaIds', $fincaIds)
                ->getQuery()
                ->getResult();
        }

        $data = [];
        foreach ($alertas as $alerta) {
            $data[] = [
                'id' => $alerta->getId(),
                'tipo' => $alerta->getTipo(),
                'mensaje' => $alerta->getMensaje(),
                'fecha' => $alerta->getFecha(),
                'leida' => $alerta->isLeida(),
                'finca_id' => $alerta->getFinca()?->getId(),
            ];
        }

        return $this->json($data);
    }

    #[Route('/fincas/{fincaId}/alertas', name: 'alertas_by_finca', methods: ['get'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function byFinca(EntityManagerInterface $entityManager, int $fincaId): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        $finca = $entityManager->getRepository(Fincas::class)->find($fincaId);
        if (!$finca) {
            return $this->json(['error' => 'Finca not found'], 404);
        }

        $fincaUser = $finca->getUser();
        if (!$fincaUser) {
            return $this->json(['error' => 'Finca user not found'], 500);
        }

        if (!$user->isAdmin() && $fincaUser->getId() !== $user->getId()) {
            return $this->json(['error' => 'Unauthorized'], 403);
        }

        $alertas = $entityManager
            ->getRepository(Alertas::class)
            ->findBy(['finca' => $fincaId]);

        $data = [];
        foreach ($alertas as $alerta) {
            $data[] = [
                'id' => $alerta->getId(),
                'tipo' => $alerta->getTipo(),
                'mensaje' => $alerta->getMensaje(),
                'fecha' => $alerta->getFecha(),
                'leida' => $alerta->isLeida(),
                'finca_id' => $alerta->getFinca()?->getId(),
            ];
        }

        return $this->json($data);
    }

    #[Route('/fincas/{fincaId}/alertasNuevas', name: 'alertas_nuevas_by_finca', methods: ['get'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function alertasNuevas(EntityManagerInterface $entityManager, int $fincaId): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        $finca = $entityManager->getRepository(Fincas::class)->find($fincaId);
        if (!$finca) {
            return $this->json(['error' => 'Finca not found'], 404);
        }

        $fincaUser = $finca->getUser();
        if (!$fincaUser) {
            return $this->json(['error' => 'Finca user not found'], 500);
        }

        if (!$user->isAdmin() && $fincaUser->getId() !== $user->getId()) {
            return $this->json(['error' => 'Unauthorized'], 403);
        }

        $alertas = $entityManager
            ->getRepository(Alertas::class)
            ->findBy(['finca' => $fincaId, 'leida' => false]);

        // Marcar todas como leídas primero
        foreach ($alertas as $alerta) {
            $alerta->setLeida(true);
        }
        $entityManager->flush();

        // Luego construir la respuesta con el estado correcto
        $data = [];
        foreach ($alertas as $alerta) {
            $data[] = [
                'id' => $alerta->getId(),
                'tipo' => $alerta->getTipo(),
                'mensaje' => $alerta->getMensaje(),
                'fecha' => $alerta->getFecha(),
                'leida' => $alerta->isLeida(),
                'finca_id' => $alerta->getFinca()?->getId(),
            ];
        }

        return $this->json($data);
    }

    #[Route('/alertas', name: 'alertas_create', methods: ['post'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function create(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        try {
            $data = json_decode($request->getContent(), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return $this->json(['error' => 'Invalid JSON format'], 400);
        }

        // Validar campos requeridos
        if (!isset($data['finca_id'])) {
            return $this->json(['error' => 'Field finca_id is required'], 400);
        }
        if (!isset($data['tipo'])) {
            return $this->json(['error' => 'Field tipo is required'], 400);
        }
        if (!isset($data['mensaje'])) {
            return $this->json(['error' => 'Field mensaje is required'], 400);
        }

        $fincaId = $data['finca_id'];
        $tipo = $data['tipo'];
        $mensaje = $data['mensaje'];

        // Validar finca_id
        if (!is_numeric($fincaId)) {
            return $this->json(['error' => 'Field finca_id must be numeric'], 400);
        }

        // Validar tipo
        if (!is_string($tipo) || strlen($tipo) === 0) {
            return $this->json(['error' => 'Field tipo must be a non-empty string'], 400);
        }
        if (strlen($tipo) > 255) {
            return $this->json(['error' => 'Field tipo must not exceed 255 characters'], 400);
        }

        // Validar mensaje
        if (!is_string($mensaje) || strlen($mensaje) === 0) {
            return $this->json(['error' => 'Field mensaje must be a non-empty string'], 400);
        }
        
        $finca = $entityManager->getRepository(Fincas::class)->find($fincaId);
        
        if (!$finca) {
            return $this->json('No finca found for id ' . $fincaId, 404);
        }

        $fincaUser = $finca->getUser();
        if (!$fincaUser) {
            return $this->json('Finca user not found', 500);
        }

        if (!$user->isAdmin() && $fincaUser->getId() !== $user->getId()) {
            return $this->json('No autorizado para crear alertas en esta finca', 403);
        }

        $alerta = new Alertas();
        $alerta->setTipo($tipo);
        $alerta->setMensaje($mensaje);
        $alerta->setFecha(new \DateTime());
        $alerta->setLeida(false);
        $alerta->setFinca($finca);
        $entityManager->persist($alerta);
        $entityManager->flush();

        $responseData = [
            'id' => $alerta->getId(),
            'tipo' => $alerta->getTipo(),
            'mensaje' => $alerta->getMensaje(),
            'fecha' => $alerta->getFecha(),
            'leida' => $alerta->isLeida(),
            'finca_id' => $alerta->getFinca()->getId(),
        ];

        return $this->json($responseData);
    }

    #[Route('/alertas/{id}', name: 'alertas_show', methods: ['get'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        $alerta = $entityManager->getRepository(Alertas::class)->find($id);
        if (!$alerta) {
            return $this->json('No alerta found for id ' . $id, 404);
        }

        $alertaFinca = $alerta->getFinca();
        if (!$alertaFinca) {
            return $this->json(['error' => 'Alerta finca not found'], 500);
        }

        $alertaFincaUser = $alertaFinca->getUser();
        if (!$alertaFincaUser) {
            return $this->json(['error' => 'Finca user not found'], 500);
        }

        if (!$user->isAdmin() && $alertaFincaUser->getId() !== $user->getId()) {
            return $this->json(['error' => 'Unauthorized'], 403);
        }

        $data = [
            'id' => $alerta->getId(),
            'tipo' => $alerta->getTipo(),
            'mensaje' => $alerta->getMensaje(),
            'fecha' => $alerta->getFecha(),
            'leida' => $alerta->isLeida(),
            'finca_id' => $alerta->getFinca()?->getId(),
        ];

        return $this->json($data);
    }

    #[Route('/alertas/{id}', name: 'alertas_update', methods: ['put', 'patch'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function update(EntityManagerInterface $entityManager, Request $request, int $id): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        $alerta = $entityManager->getRepository(Alertas::class)->find($id);
        if (!$alerta) {
            return $this->json('No alerta found for id ' . $id, 404);
        }

        $alertaFinca = $alerta->getFinca();
        if (!$alertaFinca) {
            return $this->json(['error' => 'Alerta finca not found'], 500);
        }

        $alertaFincaUser = $alertaFinca->getUser();
        if (!$alertaFincaUser) {
            return $this->json(['error' => 'Finca user not found'], 500);
        }

        if (!$user->isAdmin() && $alertaFincaUser->getId() !== $user->getId()) {
            return $this->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $data = json_decode($request->getContent(), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return $this->json(['error' => 'Invalid JSON format'], 400);
        }

        // Validar tipo si se proporciona
        if (isset($data['tipo'])) {
            $tipo = $data['tipo'];
            if (!is_string($tipo) || strlen($tipo) === 0) {
                return $this->json(['error' => 'Field tipo must be a non-empty string'], 400);
            }
            if (strlen($tipo) > 255) {
                return $this->json(['error' => 'Field tipo must not exceed 255 characters'], 400);
            }
            $alerta->setTipo($tipo);
        }

        // Validar mensaje si se proporciona
        if (isset($data['mensaje'])) {
            $mensaje = $data['mensaje'];
            if (!is_string($mensaje) || strlen($mensaje) === 0) {
                return $this->json(['error' => 'Field mensaje must be a non-empty string'], 400);
            }
            $alerta->setMensaje($mensaje);
        }

        // Validar leida si se proporciona
        if (isset($data['leida'])) {
            if (!is_bool($data['leida'])) {
                return $this->json(['error' => 'Field leida must be a boolean'], 400);
            }
            $alerta->setLeida($data['leida']);
        }

        $entityManager->flush();

        $responseData = [
            'id' => $alerta->getId(),
            'tipo' => $alerta->getTipo(),
            'mensaje' => $alerta->getMensaje(),
            'fecha' => $alerta->getFecha(),
            'leida' => $alerta->isLeida(),
            'finca_id' => $alerta->getFinca()->getId(),
        ];

        return $this->json($responseData);
    }

    #[Route('/alertas/{id}', name: 'alertas_delete', methods: ['delete'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function delete(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        $alerta = $entityManager->getRepository(Alertas::class)->find($id);
        if (!$alerta) {
            return $this->json('No alerta found for id ' . $id, 404);
        }

        $alertaFinca = $alerta->getFinca();
        if (!$alertaFinca) {
            return $this->json(['error' => 'Alerta finca not found'], 500);
        }

        $alertaFincaUser = $alertaFinca->getUser();
        if (!$alertaFincaUser) {
            return $this->json(['error' => 'Finca user not found'], 500);
        }

        if (!$user->isAdmin() && $alertaFincaUser->getId() !== $user->getId()) {
            return $this->json(['error' => 'Unauthorized'], 403);
        }

        $entityManager->remove($alerta);
        $entityManager->flush();

        return $this->json('Deleted an alerta successfully with id ' . $id);
    }
}