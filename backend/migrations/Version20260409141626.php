<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260409141626 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE alertas ADD finca_id INT NOT NULL');
        $this->addSql('ALTER TABLE alertas ADD CONSTRAINT FK_B96D7DC89B7E9090 FOREIGN KEY (finca_id) REFERENCES fincas (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_B96D7DC89B7E9090 ON alertas (finca_id)');
        $this->addSql('ALTER TABLE fincas ADD CONSTRAINT FK_DFCFD7F1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_DFCFD7F1A76ED395 ON fincas (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE alertas DROP FOREIGN KEY FK_B96D7DC89B7E9090');
        $this->addSql('DROP INDEX IDX_B96D7DC89B7E9090 ON alertas');
        $this->addSql('ALTER TABLE alertas DROP finca_id');
        $this->addSql('ALTER TABLE fincas DROP FOREIGN KEY FK_DFCFD7F1A76ED395');
        $this->addSql('DROP INDEX IDX_DFCFD7F1A76ED395 ON fincas');
    }
}
