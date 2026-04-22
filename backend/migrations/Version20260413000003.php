<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Replace api_key with token
 */
final class Version20260413000003 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Replace api_key column with token column';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user DROP COLUMN api_key');
        $this->addSql('ALTER TABLE user ADD token VARCHAR(500) UNIQUE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user DROP COLUMN token');
        $this->addSql('ALTER TABLE user ADD api_key VARCHAR(255) UNIQUE DEFAULT NULL');
    }
}
