<?php

namespace App\Controller;

use App\Service\WeatherService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class TestWeatherController extends AbstractController
{
    #[Route('/test-clima', name: 'app_test_clima')]
    public function index(WeatherService $weatherService): JsonResponse
    {
        // Coordenadas de prueba (Zona agrícola de Murcia)
        $lat = 37.99;
        $lon = -1.13;

        // Usamos tu servicio nuevo
        $datos = $weatherService->getWeatherAndAlerts($lat, $lon);

        return $this->json($datos);
    }
}
