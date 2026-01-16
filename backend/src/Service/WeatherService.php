<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class WeatherService
{
    // Constructor: Symfony lee tu services.yaml y ve que $weatherApiKey coincide con lo que escribiste allí.
    public function __construct(
        private HttpClientInterface $client,
        private string $weatherApiKey 
    ) {}

    public function getWeatherAndAlerts(float $lat, float $lon): array
    {
        // 1. Petición a OpenWeatherMap
        $response = $this->client->request(
            'GET',
            'https://api.openweathermap.org/data/2.5/weather',
            [
                'query' => [
                    'lat' => $lat,
                    'lon' => $lon,
                    'appid' => $this->weatherApiKey,
                    'units' => 'metric', // Grados Celsius
                    'lang' => 'es'       // Español
                ]
            ]
        );

        // Convertimos el JSON de respuesta a un Array PHP
        $data = $response->toArray();

        // 2. Extraer datos clave (Temperaturas, humedad etc)
        $temp = $data['main']['temp'];       
        $humedad = $data['main']['humidity']; 
        $clima = $data['weather'][0]['description']; 

        // 3. LA "IA" (Tu Lógica Heurística) 
        $alerta = null;

        if ($humedad > 80 && $temp > 20) {
            $alerta = [
                'tipo' => 'RIESGO_HONGOS',
                'mensaje' => 'Alta humedad y calor. Riesgo elevado de hongos (Mildiu/Oidio).',
                'nivel' => 'ALTO'
            ];
        } elseif ($temp < 2) {
            $alerta = [
                'tipo' => 'RIESGO_HELADA',
                'mensaje' => 'Temperaturas cercanas a 0ºC. Protege los cultivos sensibles.',
                'nivel' => 'CRITICO'
            ];
        } else {
            $alerta = [
                'tipo' => 'SIN_RIESGOS',
                'mensaje' => 'Condiciones óptimas. No se detectan amenazas.',
                'nivel' => 'BAJO'
            ];
        }

        // 4. Devolvemos el paquete completo
        return [
            'ubicacion' => $data['name'],
            'temperatura' => $temp,
            'humedad' => $humedad,
            'descripcion' => $clima,
            'analisis_inteligente' => $alerta 
        ];
    }
}