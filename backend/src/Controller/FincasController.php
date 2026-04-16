<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\Fincas;
use App\Entity\User;

#[Route('/api', name: 'api_')]
class FincasController extends AbstractController
{
    #[Route('/fincas', name: 'fincas_index', methods: ['get'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        if ($user->isAdmin()) {
            $fincas = $entityManager->getRepository(Fincas::class)->findAll();
        } else {
            $fincas = $entityManager
                ->getRepository(Fincas::class)
                ->findBy(['user' => $user]);
        }

        $data = [];
        foreach ($fincas as $finca) {
            $data[] = [
                'id' => $finca->getId(),
                'user_id' => $finca->getUser()?->getId(),
                'nombre' => $finca->getNombre(),
                'hectareas' => $finca->getHectareas(),
                'geo_json' => $finca->getGeoJson(),
            ];
        }

        return $this->json($data);
    }

    #[Route('/fincas', name: 'fincas_create', methods: ['post'])]
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
        if (!isset($data['nombre'])) {
            return $this->json(['error' => 'Field nombre is required'], 400);
        }

        $nombre = $data['nombre'];
        $hectareas = $data['hectareas'] ?? null;
        $geoJson = $data['geo_json'] ?? [];

        // Validar nombre
        if (!is_string($nombre) || strlen($nombre) === 0) {
            return $this->json(['error' => 'Field nombre must be a non-empty string'], 400);
        }
        if (strlen($nombre) > 255) {
            return $this->json(['error' => 'Field nombre must not exceed 255 characters'], 400);
        }

        // Validar hectareas
        if ($hectareas !== null) {
            if (!is_numeric($hectareas)) {
                return $this->json(['error' => 'Field hectareas must be numeric'], 400);
            }
            if ($hectareas <= 0) {
                return $this->json(['error' => 'Field hectareas must be greater than 0'], 400);
            }
        }

        // Validar que geo_json sea un array
        if (!is_array($geoJson)) {
            return $this->json(['error' => 'Field geo_json must be an array'], 400);
        }
        
        $finca = new Fincas();
        $finca->setUser($user);
        $finca->setNombre($nombre);
        $finca->setHectareas($hectareas);
        $finca->setGeoJson($geoJson);
        $entityManager->persist($finca);
        $entityManager->flush();

        $responseData = [
            'id' => $finca->getId(),
            'user_id' => $finca->getUser()->getId(),
            'nombre' => $finca->getNombre(),
            'hectareas' => $finca->getHectareas(),
            'geo_json' => $finca->getGeoJson(),
        ];

        return $this->json($responseData);
    }

    #[Route('/fincas/{id}', name: 'fincas_show', methods: ['get'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        $finca = $entityManager->getRepository(Fincas::class)->find($id);
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

        $data = [
            'id' => $finca->getId(),
            'user_id' => $finca->getUser()?->getId(),
            'nombre' => $finca->getNombre(),
            'hectareas' => $finca->getHectareas(),
            'geo_json' => $finca->getGeoJson(),
        ];

        return $this->json($data);
    }

    #[Route('/fincas/{id}', name: 'fincas_update', methods: ['put', 'patch'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function update(EntityManagerInterface $entityManager, Request $request, int $id): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        $finca = $entityManager->getRepository(Fincas::class)->find($id);
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

        try {
            $data = json_decode($request->getContent(), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return $this->json(['error' => 'Invalid JSON format'], 400);
        }

        // Validar nombre si se proporciona
        if (isset($data['nombre'])) {
            $nombre = $data['nombre'];
            if (!is_string($nombre) || strlen($nombre) === 0) {
                return $this->json(['error' => 'Field nombre must be a non-empty string'], 400);
            }
            if (strlen($nombre) > 255) {
                return $this->json(['error' => 'Field nombre must not exceed 255 characters'], 400);
            }
            $finca->setNombre($nombre);
        }

        // Validar hectareas si se proporciona
        if (isset($data['hectareas'])) {
            if (!is_numeric($data['hectareas'])) {
                return $this->json(['error' => 'Field hectareas must be numeric'], 400);
            }
            if ($data['hectareas'] <= 0) {
                return $this->json(['error' => 'Field hectareas must be greater than 0'], 400);
            }
            $finca->setHectareas($data['hectareas']);
        }

        // Validar geo_json si se proporciona
        if (isset($data['geo_json'])) {
            if (!is_array($data['geo_json'])) {
                return $this->json(['error' => 'Field geo_json must be an array'], 400);
            }
            $finca->setGeoJson($data['geo_json']);
        }

        $entityManager->flush();

        $responseData = [
            'id' => $finca->getId(),
            'user_id' => $finca->getUser()->getId(),
            'nombre' => $finca->getNombre(),
            'hectareas' => $finca->getHectareas(),
            'geo_json' => $finca->getGeoJson(),
        ];

        return $this->json($responseData);
    }

    #[Route('/fincas/{id}', name: 'fincas_delete', methods: ['delete'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function delete(EntityManagerInterface $entityManager, int $id): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        $finca = $entityManager->getRepository(Fincas::class)->find($id);
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

        $entityManager->remove($finca);
        $entityManager->flush();

        return $this->json('Deleted a finca successfully with id ' . $id);
    }
}
