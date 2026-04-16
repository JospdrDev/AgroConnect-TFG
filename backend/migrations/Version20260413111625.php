<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Change admin column to BOOLEAN type
 */
final class Version20260413111625 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Change admin column to BOOLEAN type with default false';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user CHANGE admin admin BOOLEAN NOT NULL DEFAULT 0');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user CHANGE admin admin TINYINT NOT NULL DEFAULT 0');
    }
}
