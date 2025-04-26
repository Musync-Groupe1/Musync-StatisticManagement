import swaggerSpec from '../../../src/config/swaggerConfig.js';

/**
 * @description
 * Ce test vérifie la validité de la configuration Swagger (OpenAPI) utilisée dans le projet.
 * Il couvre les métadonnées, les serveurs, et les schémas principaux.
 */
describe('swaggerSpec (unit test)', () => {

  /**
   * GIVEN : La configuration Swagger générée via swagger-jsdoc
   * WHEN  : On accède à la propriété "openapi"
   * THEN  : Elle doit être définie en version "3.0.0"
   */
  it('should define OpenAPI version 3.0.0', () => {
    expect(swaggerSpec.openapi).toBe('3.0.0');
  });

  /**
   * GIVEN : La configuration Swagger
   * WHEN  : On consulte les métadonnées de l’API (info)
   * THEN  : Le titre doit être "MuSync - Statistics API" et la version "1.0.0"
   */
  it('should contain API info with title and version', () => {
    expect(swaggerSpec.info).toBeDefined();
    expect(swaggerSpec.info.title).toBe('MuSync - Statistics API');
    expect(swaggerSpec.info.version).toBe('1.0.0');
  });

  /**
   * GIVEN : La configuration Swagger
   * WHEN  : On accède à la liste des serveurs
   * THEN  : Le premier serveur doit être défini avec l’URL localhost
   */
  it('should define development server with URL', () => {
    expect(swaggerSpec.servers).toBeDefined();
    expect(swaggerSpec.servers[0]).toHaveProperty('url');
    expect(swaggerSpec.servers[0].url).toContain('http://localhost:3000');
  });

  /**
   * GIVEN : La configuration Swagger
   * WHEN  : On consulte les composants / schémas définis
   * THEN  : Le schéma "UserMusicStatistic" doit exister et contenir les champs clés
   */
  it('should include UserMusicStatistic schema in components', () => {
    const components = swaggerSpec.components;
    expect(components).toBeDefined();
    expect(components.schemas).toHaveProperty('UserMusicStatistic');
    expect(components.schemas.UserMusicStatistic.type).toBe('object');
    expect(components.schemas.UserMusicStatistic.properties).toHaveProperty('user_id');
    expect(components.schemas.UserMusicStatistic.properties).toHaveProperty('favorite_genre');
  });

  /**
   * GIVEN : Le schéma UserMusicStatistic
   * WHEN  : On regarde ses propriétés top_listened_artists et top_listened_musics
   * THEN  : Elles doivent référencer correctement les schémas TopListenedArtist et TopListenedMusic
   */
  it('should reference TopListenedArtist and TopListenedMusic in UserMusicStatistic', () => {
    const schema = swaggerSpec.components.schemas.UserMusicStatistic;
    expect(schema.properties.top_listened_artists.items.$ref).toBe('#/components/schemas/TopListenedArtist');
    expect(schema.properties.top_listened_musics.items.$ref).toBe('#/components/schemas/TopListenedMusic');
  });
});