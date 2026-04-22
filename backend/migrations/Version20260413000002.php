<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Types\Types;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260413000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set leida column default value to false';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('UPDATE alertas SET leida = 0 WHERE leida IS NULL');
        $this->addSql('ALTER TABLE alertas CHANGE leida leida TINYINT NOT NULL DEFAULT 0');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE alertas CHANGE leida leida TINYINT DEFAULT NULL');
    }
}
