<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    #[ORM\Column(length: 180, unique: true)]
    private ?string $username = null;

    /**
     * @var string La contraseña hasheada
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 500, nullable: true, unique: true)]
    private ?string $token = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $admin = false;

    #[ORM\OneToMany(targetEntity: Fincas::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $fincas;

    public function __construct()
    {
        $this->fincas = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getUsername(): string {

    return $this->username;

    }
    public function setUsername(string $username): self {

    $this->username = $username;
    return $this;

    }
    /**
     * Un identificador visual que representa este usuario.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = ['ROLE_USER'];
        if ($this->admin) {
            $roles[] = 'ROLE_ADMIN';
        }
        return $roles;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(?string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function isAdmin(): bool
    {
        return $this->admin;
    }

    public function setAdmin(bool $admin): static
    {
        $this->admin = $admin;

        return $this;
    }

    /**
     * Asegurar que la sesión no contenga hashes de contraseña reales hashéandolos con CRC32C,
     * como se soporta desde Symfony 7.3.
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0".self::class."\0password"] = hash('crc32c', $this->password);

        return $data;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // @deprecated, se eliminará al actualizar a Symfony 8
    }

    /**
     * @return Collection<int, Fincas>
     */
    public function getFincas(): Collection
    {
        return $this->fincas;
    }

    public function addFinca(Fincas $finca): static
    {
        if (!$this->fincas->contains($finca)) {
            $this->fincas->add($finca);
            $finca->setUser($this);
        }

        return $this;
    }

    public function removeFinca(Fincas $finca): static
    {
        if ($this->fincas->removeElement($finca)) {
            if ($finca->getUser() === $this) {
                $finca->setUser(null);
            }
        }

        return $this;
    }
}
