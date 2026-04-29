AgroConnect - Sistema de Gestión Agrícola 4.0

AgroConnect es una solución integral orientada a la democratización tecnológica del sector primario. Se trata de una aplicación web de tipo Single Page Application (SPA) diseñada bajo una arquitectura Cliente-Servidor, que unifica la administración técnica de explotaciones agrícolas con un motor de inteligencia climática proactivo.  
🏗️ Arquitectura del Sistema

El sistema implementa un modelo de desacoplamiento total entre las capas de presentación y de negocio, facilitando la escalabilidad y el mantenimiento.  

    Frontend: Desarrollado en Angular, utiliza un flujo de datos reactivo basado en el patrón Observer mediante la librería RxJS.  

    Backend: Basado en Symfony 7.4 (PHP 8.2), actuando como una API RESTful robusta que gestiona la lógica de negocio, la persistencia y la seguridad.  

    Seguridad: Implementa una autenticación stateless mediante JSON Web Tokens (JWT), asegurando las comunicaciones con cifrado OpenSSL.  

🛠️ Stack Tecnológico
Backend (Ecosistema Symfony)

    Framework: Symfony 7.4 con arquitectura MVC.  

    ORM: Doctrine para la abstracción de la base de datos y prevención de inyecciones SQL.  

    Gestión de API: FOSRestBundle para estandarización de respuestas y JMS Serializer para la transformación de objetos a JSON.  

    Seguridad: LexikJWTAuthenticationBundle para el manejo de tokens de acceso.  

    Notificaciones: Symfony Mailer para el envío de alertas críticas por SMTP.  

Frontend (Ecosistema Angular)

    Framework: Angular (TypeScript) con estructura modular.  

    Visualización GIS: Leaflet y Leaflet Draw para la delimitación geográfica de parcelas mediante polígonos vectoriales y GeoJSON.  

    Gráficos 3D: Three.js (WebGL) y GSAP para animaciones fluidas y renderizado inmersivo en la Landing Page.  

    Dashboard: Implementación de PrimeNG para gráficas analíticas y diseño Bento Grid mediante CSS nativo.  

Infraestructura y Datos

    Base de Datos: MariaDB/MySQL bajo un modelo relacional 1:N (Usuario -> Fincas -> Alertas).  

    Servidor Web: Apache (entornos de desarrollo mediante XAMPP).  

    APIs Externas: Integración con OpenWeather API para la captura de métricas meteorológicas en tiempo real.  

📡 Documentación de la API

La API se expone bajo la URL base http://{Domainname}/api y requiere el encabezado Authorization: Bearer {token} para la mayoría de los recursos.  
Gestión de Usuarios y Autenticación

    POST /api/register: Registro de nuevos gestores agrícolas.  

    POST /api/login_check: Intercambio de credenciales por un Token JWT válido.  

    POST /api/change-password: Modificación de credenciales de seguridad.  

Recursos de Fincas (GIS)

    GET /api/fincas: Listado de explotaciones (filtrado por propiedad o rol de administrador).  

    POST /api/fincas: Alta de nueva parcela con datos geográficos en formato GeoJSON.  

    DELETE /api/fincas/{id}: Eliminación de recurso con borrado en cascada de alertas asociadas.  

Sistema de Alertas

    GET /api/alertas: Consulta de incidencias meteorológicas activas.  

    PATCH /api/alertas/{id}: Marcado de alertas como leídas tras la intervención del técnico.  

⚡ Motor de Inteligencia Climática

El sistema utiliza un motor heurístico basado en reglas agronómicas. Al cargar el Dashboard, el Backend evalúa dinámicamente las coordenadas de cada finca:  

    Consulta a OpenWeatherMap para obtener datos de temperatura, humedad y viento.  

    Clasifica el riesgo (BAJO, ALTO, CRÍTICO).  

    Implementa CacheInterface (3 horas) para optimizar la latencia y respetar las cuotas de la API externa.  

    En niveles CRÍTICOS, dispara un evento asíncrono para notificaciones vía email.  

📈 Especificaciones de Diseño (UI/UX)

    Dark Mode Nativo: Orientado a la reducción de fatiga visual y ahorro de energía en dispositivos móviles.  

    Algoritmo HSL: Generación matemática de colores únicos para cultivos basada en el Ángulo Áureo (137.5º), garantizando contraste infinito en las gráficas analíticas.  

    Rendimiento: Renderizado a 60 FPS mediante la gestión estricta de ChangeDetection de Angular y el uso de gradientes cónicos CSS nativos para indicadores radiales.  

👥 Autores

    José Pedro Marín López: Integración Angular-API, lógica RxJS e inteligencia climática.  

    Mario Bonache Ballesteros: Configuración Backend Symfony, sistema JWT y CRUD persistente.  

    Héctor González Martínez: Gestión de cartografía GIS y mapas interactivos.  

Este proyecto es parte del Ciclo de Técnico Superior en Desarrollo de Aplicaciones Web del IES José Planes
