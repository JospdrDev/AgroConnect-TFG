<?php
namespace App\Controller;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use App\Entity\User;

#[Route('/api', name: 'api_')]
class RegistrationController extends AbstractController
{
    #[Route('/register', name: 'register', methods: 'post')]
    public function index(
        ManagerRegistry $doctrine,
        Request $request,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        try {
            // Parsear JSON
            $data = json_decode($request->getContent(), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return $this->json(['error' => 'Invalid JSON format'], 400);
        }

        // Validar campos requeridos
        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->json(['error' => 'Email and password are required'], 400);
        }

        $email = $data['email'];
        $password = $data['password'];

        // Validar formato de email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Invalid email format'], 400);
        }

        // Validar longitud de contraseña
        if (strlen($password) < 8) {
            return $this->json(['error' => 'Password must be at least 8 characters'], 400);
        }

        if (strlen($password) > 255) {
            return $this->json(['error' => 'Password must not exceed 255 characters'], 400);
        }

        // Validar longitud de email
        if (strlen($email) > 180) {
            return $this->json(['error' => 'Email must not exceed 180 characters'], 400);
        }

        $em = $doctrine->getManager();
        $user = new User();
        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);
        $user->setEmail($email);
        $user->setUsername($email);

        try {
            $em->persist($user);
            $em->flush();
        } catch (UniqueConstraintViolationException $e) {
            return $this->json(['error' => 'Email already registered'], 409);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Registration failed'], 500);
        }

        return $this->json(['message' => 'User registered successfully'], 201);
    }

    #[Route('/logout', name: 'logout', methods: 'post')]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function logout(): JsonResponse
    {
        $user = $this->getUser();
        assert($user instanceof User);

        // Tokens JWT son sin estado, por lo que el logout es manejado por el cliente
        // simplemente descartando el token. Este endpoint confirma el logout.
        return $this->json(['message' => 'Logged out successfully'], 200);
    }

    #[Route('/change-password', name: 'change_password', methods: 'post')]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function changePassword(
        ManagerRegistry $doctrine,
        Request $request,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $user = $this->getUser();
        assert($user instanceof User);

        try {
            $data = json_decode($request->getContent(), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return $this->json(['error' => 'Invalid JSON format'], 400);
        }

        // Validar campos requeridos
        if (!isset($data['current_password']) || !isset($data['new_password'])) {
            return $this->json(['error' => 'current_password and new_password are required'], 400);
        }

        $currentPassword = $data['current_password'];
        $newPassword = $data['new_password'];

        // Verificar contraseña actual
        if (!$passwordHasher->isPasswordValid($user, $currentPassword)) {
            return $this->json(['error' => 'Current password is invalid'], 401);
        }

        // Validar longitud de nueva contraseña
        if (strlen($newPassword) < 8) {
            return $this->json(['error' => 'New password must be at least 8 characters'], 400);
        }

        if (strlen($newPassword) > 255) {
            return $this->json(['error' => 'New password must not exceed 255 characters'], 400);
        }

        // Prevenir la misma contraseña
        if ($currentPassword === $newPassword) {
            return $this->json(['error' => 'New password must be different from current password'], 400);
        }

        // Hashear y actualizar contraseña
        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        $em = $doctrine->getManager();
        $em->persist($user);
        $em->flush();

        return $this->json(['message' => 'Password changed successfully'], 200);
    }

    #[Route('/change-email', name: 'change_email', methods: 'post')]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function changeEmail(
        ManagerRegistry $doctrine,
        Request $request,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $user = $this->getUser();
        assert($user instanceof User);

        try {
            $data = json_decode($request->getContent(), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return $this->json(['error' => 'Invalid JSON format'], 400);
        }

        // Validar campos requeridos
        if (!isset($data['password']) || !isset($data['new_email'])) {
            return $this->json(['error' => 'password and new_email are required'], 400);
        }

        $password = $data['password'];
        $newEmail = $data['new_email'];

        // Verificar contraseña
        if (!$passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['error' => 'Password is invalid'], 401);
        }

        // Validar nuevo formato de email
        if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Invalid email format'], 400);
        }

        // Validar longitud de email
        if (strlen($newEmail) > 180) {
            return $this->json(['error' => 'Email must not exceed 180 characters'], 400);
        }

        // Prevenir el mismo email
        if ($user->getEmail() === $newEmail) {
            return $this->json(['error' => 'New email must be different from current email'], 400);
        }

        // Verificar si el email ya existe
        $em = $doctrine->getManager();
        $existingUser = $em->getRepository(User::class)->findOneBy(['email' => $newEmail]);
        if ($existingUser) {
            return $this->json(['error' => 'Email already registered'], 409);
        }

        // Actualizar email y nombre de usuario
        $user->setEmail($newEmail);
        $user->setUsername($newEmail);

        $em->persist($user);
        $em->flush();

        return $this->json(['message' => 'Email changed successfully'], 200);
    }
}