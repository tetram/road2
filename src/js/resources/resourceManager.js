'use strict';

const storageManager = require('../utils/storageManager');
const osrmResource = require('../resources/osrmResource');
const pgrResource = require('../resources/pgrResource');
const log4js = require('log4js');

// Création du LOGGER
var LOGGER = log4js.getLogger("RESOURCEMANAGER");

module.exports = class resourceManager {

  /**
  *
  * @function
  * @name constructor
  * @description Constructeur de la classe resourceManager
  *
  */
  constructor() {

    // Liste des ids des ressources vérifiées par le manager
    this._listOfVerifiedResourceIds = new Array();

    // Liste des ids des ressources gérées par le manager
    this._listOfResourceIds = new Array();

  }

  /**
  *
  * @function
  * @name get listOfResourceIds
  * @description Récupérer l'ensemble des ids de ressources
  *
  */
  get listOfResourceIds() {
    return this._listOfResourceIds;
  }

  /**
  *
  * @function
  * @name checkResource
  * @description Fonction utilisée pour vérifier le contenu d'un fichier de description d'une ressource.
  * @param {json} resourceJsonObject - Description JSON de la ressource
  * @return {boolean} vrai si tout c'est bien passé et faux s'il y a eu une erreur
  *
  */

  checkResource(resourceJsonObject, sourceManager) {

    LOGGER.info("Verification de la ressource...");

    // ID
    if (!resourceJsonObject.resource.id) {
      LOGGER.error("La ressource ne contient pas d'id.");
      return false;
    } else {
      LOGGER.info("Ressource id: " + resourceJsonObject.resource.id);
      // On vérifie que l'id de la ressource n'est pas déjà pris par une autre ressource.
      if (this._listOfVerifiedResourceIds.length !== 0) {
        for (let i = 0; i < this._listOfVerifiedResourceIds.length; i++ ) {
          if (this._listOfVerifiedResourceIds[i] === resourceJsonObject.resource.id) {
            LOGGER.error("Une ressource contenant l'id " + resourceJsonObject.resource.id + " a deja ete verifiee. Cette ressource ne peut donc etre ajoutee.");
            return false;
          }
        }
      } else {
        // C'est la première ressource.
      }
    }

    // Type
    if (!resourceJsonObject.resource.type) {
      LOGGER.error("La ressource ne contient pas de type.");
      return false;
    } else {
      // Vérification que le type est valide puis vérification spécifique à chaque type
      let available = false;
      // La partie délimitée peut être copié-collée pour ajouter un nouveau type.
      // Il ne reste plus qu'à créer la fonction de vérification correspondante.
      //------ OSRM
      if (resourceJsonObject.resource.type === "osrm") {
        available = true;
        LOGGER.info("Ressource osrm.");
        if (!this.checkResourceOsrm(resourceJsonObject.resource, sourceManager)) {
          LOGGER.error("Erreur lors de la verification de la ressource osrm.");
          return false;
        } else {
          // il n'y a eu aucun problème, la ressource est correctement configurée.
        }
      } else {
        // On va voir si c'est un autre type.
      }
      //------ OSRM
      //------ PGR
      if (resourceJsonObject.resource.type === "pgr") {
        available = true;
        LOGGER.info("Ressource pgrouting.");
        if (!this.checkResourcePgr(resourceJsonObject.resource, sourceManager)) {
          LOGGER.error("Erreur lors de la verification de la ressource pgr.");
          return false;
        } else {
          // il n'y a eu aucun problème, la ressource est correctement configurée.
        }
      } else {
        // On va voir si c'est un autre type.
      }
      //------ PGR

      // Si ce n'est aucun type valide, on renvoie une erreur.
      if (!available) {
        LOGGER.error("La ressource indique un type invalide: " + resourceJsonObject.resource.type);
        return false;
      }
    }

    // on sauvegarde l'id de la ressource pour savoir qu'elle a déjà été vérifiée et que sa description est valide
    this._listOfVerifiedResourceIds.push(resourceJsonObject.resource.id);

    LOGGER.info("Fin de la verification de la ressource.");
    return true;

  }


  /**
  *
  * @function
  * @name checkResourceOsrm
  * @description Fonction utilisée pour vérifier le contenu d'un fichier de description d'une ressource osrm.
  * @param {json} resourceJsonObject - Description JSON de la ressource
  * @return {boolean} vrai si tout c'est bien passé et faux s'il y a eu une erreur
  *
  */

  checkResourceOsrm(resourceJsonObject, sourceManager) {

    LOGGER.info("Verification de la ressource osrm...");

    // Description
    if (!resourceJsonObject.description) {
      LOGGER.error("La ressource ne contient pas de description.");
      return false;
    } else {
      // rien à faire
    }

    // Topology
    if (!resourceJsonObject.topology) {
      LOGGER.error("La ressource ne contient pas de topologie.");
      return false;
    } else {
      // Description de la topologie
      if (!resourceJsonObject.topology.description) {
        LOGGER.error("La ressource ne contient pas de description de la topologie.");
        return false;
      } else {
        // rien à faire
      }
      // Stockage de la topologie
      if (!resourceJsonObject.topology.storage) {
        LOGGER.error("La ressource ne contient pas d'information sur le stockage du fichier de generation de la topologie.");
        return false;
      } else {
        if (!storageManager.checkJsonStorage(resourceJsonObject.topology.storage)) {
          LOGGER.error("Stockage de la topologie incorrect.");
          return false;
        } else {
          // rien à faire
        }
      }
      // Projection de la topologie
      if (!resourceJsonObject.topology.projection) {
        LOGGER.error("La ressource ne contient pas d'information sur la projection de la topologie.")
        return false;
      } else {
        // TODO: vérifier la projection
      }
    }

    // Sources
    if (!resourceJsonObject.sources) {
      LOGGER.error("La ressource ne contient pas de sources.");
      return false;
    } else {

      LOGGER.info("Verification des sources...")

      for (let i = 0; i < resourceJsonObject.sources.length; i++ ) {

        let sourceJsonObject = resourceJsonObject.sources[i];
        if (!sourceManager.checkSource(sourceJsonObject)) {
          LOGGER.error("La ressource contient une source invalide.");
          return false;
        } else {
          // on ne fait rien
        }

      }
    }

    // AvailableOperations
    if (!resourceJsonObject.availableOperations) {
      LOGGER.error("La ressource ne contient pas de descriptions sur les operations possibles.");
      return false;
    } else {

    }

    // DefaultSourceId
    if (!resourceJsonObject.defaultSourceId) {
      LOGGER.error("La ressource ne contient pas un id de source par defaut.");
      return false;
    } else {

      let foundId = false;

      for (let i = 0; i < resourceJsonObject.sources.length; i++ ) {
        let sourceJsonObject = resourceJsonObject.sources[i];

        if (sourceJsonObject.id === resourceJsonObject.defaultSourceId) {
          foundId = true;
          break;
        }
      }
      if (!foundId) {
        LOGGER.error("L'id par defaut de la ressource ne correspond a aucun id de sources definies.");
        return false;
      }

    }

    // DefaultProjection
    if (!resourceJsonObject.defaultProjection) {
      LOGGER.warn("La ressource ne contient pas de projection par défaut. C'est celle de la topologie qui sera utilisee.");
    } else {
      // TODO: vérification de la disponibilité et de la cohérence avec la projection de la topologie.
    }

    // BoundingBox
    if (!resourceJsonObject.boundingBox) {
      LOGGER.warn("La ressource ne contient pas de boundingBox.");
    } else {
      // TODO: vérification géométrique et cohérence avec la projection par défaut ou de la topologie.
    }

    // AvailableProjection
    if (!resourceJsonObject.availableProjections) {
      LOGGER.warn("La ressource ne contient pas de projections rendues disponibles. C'est celle de la topologie qui sera utilisee.");
    } else {
      // TODO: vérification de la disponibilité et de la cohérence avec la projection de la topologie.
    }

    LOGGER.info("Fin de la verification de la ressource osrm.");
    return true;

  }

  /**
  *
  * @function
  * @name checkResourcePgr
  * @description Fonction utilisée pour vérifier le contenu d'un fichier de description d'une ressource pgr.
  * @param {json} resourceJsonObject - Description JSON de la ressource
  * @return {boolean} vrai si tout c'est bien passé et faux s'il y a eu une erreur
  * TODO: c'est une copie conforme de checkResourceOsrm, c'est pas terrible (à factoriser ou spécialiser)
  */

 checkResourcePgr(resourceJsonObject, sourceManager) {

  LOGGER.info("Verification de la ressource pgr...");

  // Description
  if (!resourceJsonObject.description) {
    LOGGER.error("La ressource ne contient pas de description.");
    return false;
  } else {
    // rien à faire
  }

  // Topology
  if (!resourceJsonObject.topology) {
    LOGGER.error("La ressource ne contient pas de topologie.");
    return false;
  } else {
    // Description de la topologie
    if (!resourceJsonObject.topology.description) {
      LOGGER.error("La ressource ne contient pas de description de la topologie.");
      return false;
    } else {
      // rien à faire
    }
    // Stockage de la topologie
    if (!resourceJsonObject.topology.storage) {
      LOGGER.error("La ressource ne contient pas d'information sur le stockage du fichier de generation de la topologie.");
      return false;
    } else {
      if (!storageManager.checkJsonStorage(resourceJsonObject.topology.storage)) {
        LOGGER.error("Stockage de la topologie incorrect.");
        return false;
      } else {
        // rien à faire
      }
    }
    // Projection de la topologie
    if (!resourceJsonObject.topology.projection) {
      LOGGER.error("La ressource ne contient pas d'information sur la projection de la topologie.")
      return false;
    } else {
      // TODO: vérifier la projection
    }
  }

  // Sources
  if (!resourceJsonObject.sources) {
    LOGGER.error("La ressource ne contient pas de sources.");
    return false;
  } else {

    LOGGER.info("Verification des sources...")

    for (let i = 0; i < resourceJsonObject.sources.length; i++ ) {

      let sourceJsonObject = resourceJsonObject.sources[i];
      if (!sourceManager.checkSource(sourceJsonObject)) {
        LOGGER.error("La ressource contient une source invalide.");
        return false;
      } else {
        // on ne fait rien
      }

    }
  }

  // AvailableOperations
  if (!resourceJsonObject.availableOperations) {
    LOGGER.error("La ressource ne contient pas de descriptions sur les operations possibles.");
    return false;
  } else {

  }

  // DefaultSourceId
  if (!resourceJsonObject.defaultSourceId) {
    LOGGER.error("La ressource ne contient pas un id de source par defaut.");
    return false;
  } else {

    let foundId = false;

    for (let i = 0; i < resourceJsonObject.sources.length; i++ ) {
      let sourceJsonObject = resourceJsonObject.sources[i];

      if (sourceJsonObject.id === resourceJsonObject.defaultSourceId) {
        foundId = true;
        break;
      }
    }
    if (!foundId) {
      LOGGER.error("L'id par defaut de la ressource ne correspond a aucun id de sources definies.");
      return false;
    }

  }

  // DefaultProjection
  if (!resourceJsonObject.defaultProjection) {
    LOGGER.warn("La ressource ne contient pas de projection par défaut. C'est celle de la topologie qui sera utilisee.");
  } else {
    // TODO: vérification de la disponibilité et de la cohérence avec la projection de la topologie.
  }

  // BoundingBox
  if (!resourceJsonObject.boundingBox) {
    LOGGER.warn("La ressource ne contient pas de boundingBox.");
  } else {
    // TODO: vérification géométrique et cohérence avec la projection par défaut ou de la topologie.
  }

  // AvailableProjection
  if (!resourceJsonObject.availableProjections) {
    LOGGER.warn("La ressource ne contient pas de projections rendues disponibles. C'est celle de la topologie qui sera utilisee.");
  } else {
    // TODO: vérification de la disponibilité et de la cohérence avec la projection de la topologie.
  }

  LOGGER.info("Fin de la verification de la ressource osrm.");
  return true;
}


  /**
  *
  * @function
  * @name createResource
  * @description Fonction utilisée pour créer une ressource.
  * @param {json} resourceJsonObject - Description JSON de la ressource
  * @return {Resource} Ressource créée
  *
  */

  createResource(resourceJsonObject) {

    let resource;

    if (!resourceJsonObject.resource.id) {
      LOGGER.error("La ressource ne contient pas d'id.");
      return null;
    }

    LOGGER.info("Creation de la ressource: " + resourceJsonObject.resource.id);

    // On vérifie que la ressource a bien été vérifiée et validée
    if (this._listOfVerifiedResourceIds.length !== 0) {
      for (let i = 0; i < this._listOfVerifiedResourceIds.length; i++ ) {
        if (this._listOfVerifiedResourceIds[i] === resourceJsonObject.resource.id) {
          LOGGER.info("La ressource contenant l'id " + resourceJsonObject.resource.id + " a deja ete verifiee.");
          break;
        }
      }
    } else {
      LOGGER.error("Tentative de creation d'une ressource sans verification prealable. Cette ressource ne peut donc etre creee.");
      return null;
    }

    // On vérifie que la ressource n'a pas déjà été créée
    if (this._listOfResourceIds.length !== 0) {
      for (let i = 0; i < this._listOfResourceIds.length; i++ ) {
        if (this._listOfResourceIds[i] === resourceJsonObject.resource.id) {
          LOGGER.error("Une ressource contenant l'id " + resourceJsonObject.resource.id + " existe deja. Cette ressource ne peut donc etre creee.");
          return null;
        }
      }
    } else {
      // C'est la première ressource.
    }

    if (resourceJsonObject.resource.type === "osrm") {
      resource = new osrmResource(resourceJsonObject);
    } else if (resourceJsonObject.resource.type === "pgr") {
      resource = new pgrResource(resourceJsonObject);
    } else {
      // On va voir si c'est un autre type.
    }

    // on sauvegarde l'id de la ressource pour savoir qu'elle a déjà été créée
    this._listOfResourceIds.push(resourceJsonObject.resource.id);

    return resource;
  }


}
