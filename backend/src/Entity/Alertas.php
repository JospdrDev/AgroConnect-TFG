<?php

namespace App\Entity;

use App\Repository\AlertasRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AlertasRepository::class)]
class Alertas
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $tipo = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $mensaje = null;

    #[ORM\Column]
    private bool $leida = false;

    #[ORM\Column]
    private ?\DateTime $fecha = null;

    #[ORM\ManyToOne(targetEntity: Fincas::class, inversedBy: 'alertas')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Fincas $finca = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    public function setTipo(string $tipo): static
    {
        $this->tipo = $tipo;

        return $this;
    }

    public function getMensaje(): ?string
    {
        return $this->mensaje;
    }

    public function setMensaje(string $mensaje): static
    {
        $this->mensaje = $mensaje;

        return $this;
    }

    public function isLeida(): bool
    {
        return $this->leida;
    }

    public function setLeida(bool $leida): static
    {
        $this->leida = $leida;

        return $this;
    }

    public function getFecha(): ?\DateTime
    {
        return $this->fecha;
    }

    public function setFecha(\DateTime $fecha): static
    {
        $this->fecha = $fecha;

        return $this;
    }

    public function getFinca(): ?Fincas
    {
        return $this->finca;
    }

    public function setFinca(?Fincas $finca): static
    {
        $this->finca = $finca;

        return $this;
    }
}
