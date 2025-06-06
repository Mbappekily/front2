import React, { useState, useEffect } from "react";
import "./DocumentsGeneration.css";
import { jsPDF } from 'jspdf';
import logo from '../assets/Sonatrach.svg.png';

function DocumentsGeneration() {
  // Déclarer tous les hooks au début du composant
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [presenceData, setPresenceData] = useState({});
  
  // Données de test pour les stages
  const [stages, setStages] = useState([
    {
      idStage: 1,
      type: "Stage PFE",
      Direction: "Direction Informatique",
      dateDebut: "2024-02-01",
      dateFin: "2024-07-31",
      duree: "6 mois",
      theme: "Développement d'une application web"
    }
  ]);

  // Données de test pour les stagiaires
  const [stagiaires, setStagiaires] = useState([
    {
      idAS: 1,
      nom: "Saidani",
      prenom: "Meriem",
      idStage: 1,
      specialite: "Informatique"
    }
  ]);

  // Données de test pour les apprentis
  const [apprentis, setApprentis] = useState([
    {
      idApprenti: 1,
      nom: "Regradj",
      prenom: "Islam",
      specialite: "Développement Web"
    }
  ]);

  // Fonction pour rafraîchir les données
  const refreshData = () => {
    // Récupérer les stages
    fetch('http://localhost:8080/stages')
      .then(res => res.json())
      .then(data => setStages(data))
      .catch(err => console.error('Erreur lors de la récupération des stages:', err));

    // Récupérer les stagiaires
    fetch('http://localhost:8080/sa')
      .then(res => res.json())
      .then(data => setStagiaires(data))
      .catch(err => console.error('Erreur lors de la récupération des stagiaires:', err));

    // Récupérer les apprentis
    fetch('http://localhost:8080/apprentis')
      .then(res => res.json())
      .then(data => setApprentis(data))
      .catch(err => console.error('Erreur lors de la récupération des apprentis:', err));
  };

  // Charger les données au montage du composant
  useEffect(() => {
    refreshData();
  }, []);

  const renderSecondSelect = () => {
    if (!selectedDocument) return null;

    let options = [];
    let label = "";

    switch (selectedDocument) {
      case "priseEnCharge":
        options = stages;
        label = "Sélectionner le stage";
        break;
      case "attestation":
        options = stagiaires;
        label = "Sélectionner le stagiaire";
        break;
      case "fichePosition":
        options = apprentis;
        label = "Sélectionner l'apprenti";
        break;
    }

    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <select
          className="form-select"
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">-- Sélectionner --</option>
          {options.map((item) => (
            <option 
              key={item.idStage || item.idAS || item.idApprenti} 
              value={item.idStage || item.idAS || item.idApprenti}
            >
              {selectedDocument === "priseEnCharge" 
                ? `${item.type} - ID: ${item.idStage}`
                : selectedDocument === "attestation"
                ? `${item.nom} ${item.prenom} - ID: ${item.idAS}`
                : `${item.nom} ${item.prenom} - ID: ${item.idApprenti}`
              }
            </option>
          ))}
        </select>
      </div>
    );
  };

  const handleCalendarSubmit = () => {
    generateFichePosition(selectedItem);
    setShowCalendar(false);
    setPresenceData({});
  };

  const generateFichePosition = (apprentiId) => {
    const apprenti = apprentis.find(a => a.idApprenti === parseInt(apprentiId));
    if (!apprenti) {
      alert("Apprenti non trouvé");
      return;
    }

    const doc = new jsPDF();
    const currentDate = new Date();
    const month = currentDate.toLocaleString('fr-FR', { month: 'long' });
    const year = currentDate.getFullYear();
    
    // En-tête avec logo (taille réduite)
    doc.addImage(logo, 'PNG', 10, 10, 20, 20);
    
    // Titre et période
    doc.setFontSize(12);
    doc.text('FICHE DE POSITION', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Pointage de la période du : 01-12-${year} au : 31-12-${year}`, 105, 22, { align: 'center' });
    doc.text(`Alger, le ${currentDate.getDate()}-${currentDate.getMonth() + 1}-${year}`, 160, 15);
    doc.text('Page : 1/1', 160, 22);
    
    // Informations de l'apprenti
    doc.setFontSize(10);
    doc.text(`Matricule : DG${apprenti.idApprenti.toString().padStart(5, '0')}`, 20, 35);
    doc.text(`Nom : ${apprenti.nom}`, 80, 35);
    doc.text(`Prénom : ${apprenti.prenom}`, 140, 35);
    doc.text('Fonction : APP GESTIONNAIRE', 20, 42);
    doc.text('Structure : Direction Centrale Digitalisation&Système d\'Information', 20, 49);
    
    // Tableau des présences
    let startY = 55;
    const cellHeight = 7;
    
    // En-tête du tableau de présence
    doc.rect(20, startY, 15, cellHeight); // Date
    doc.rect(35, startY, 15, cellHeight); // J
    doc.rect(50, startY, 20, cellHeight); // Pos.
    doc.rect(70, startY, 60, cellHeight); // Observations
    
    doc.text('Date', 23, startY + 5);
    doc.text('J', 40, startY + 5);
    doc.text('Pos.', 55, startY + 5);
    doc.text('Observations', 85, startY + 5);
    
    // Corps du tableau
    startY += cellHeight;
    const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const today = currentDate.getDate();  // Ajout de cette ligne
    
    Array.from({ length: today }, (_, i) => i + 1).forEach(day => {
      const date = new Date(year, currentDate.getMonth(), day);
      const dayOfWeek = daysOfWeek[date.getDay()];
      
      doc.rect(20, startY, 15, cellHeight);
      doc.rect(35, startY, 15, cellHeight);
      doc.rect(50, startY, 20, cellHeight);
      doc.rect(70, startY, 60, cellHeight);
      
      doc.text(String(day), 25, startY + 5);
      doc.text(dayOfWeek, 40, startY + 5);
      
      const dayData = presenceData[day] || { etat: "present", observation: "" };
      const etatAffiche = {
        "present": "P",
        "absent": "AA",
        "conge": "F",
        "mission": "RH"
      }[dayData.etat];
      
      doc.text(etatAffiche, 55, startY + 5);
      
      if (dayData.observation) {
        doc.text(dayData.observation, 75, startY + 5);
      }
      
      startY += cellHeight;
    });
    
    // État du pointage
    doc.rect(140, 55, 60, 40);
    doc.text('ETAT DU POINTAGE', 150, 60);
    doc.text('Type pointage :', 145, 70);
    doc.text('AA    F    P    RH', 145, 77);
    doc.text('Nb Jours :', 145, 85);
    
    // Primes et indemnités
    doc.rect(140, 100, 60, 80);
    doc.text('PRIMES ET INDEMNITES', 150, 105);
    doc.text('PANIER :', 145, 115);
    doc.text('RETENUE PANIER :', 145, 125);
    doc.text('NOURRITURE :', 145, 135);
    doc.text('ITZIN :', 145, 145);
    doc.text('IZCV :', 145, 155);
    doc.text('IND.ROUTE :', 145, 165);
    doc.text('RETARD :', 145, 175);
    
    // Observations générales
    doc.rect(140, 185, 60, 40);
    doc.text('OBSERVATIONS', 150, 190);
    
    // Zone de signature avec tableau unique
    const signatureStartX = 20;
    const signatureWidth = 110;
    const signatureHeight = 45;
    const headerHeight = 15;
    const signatureMarginTop = 20;
    
    // Calcul de la position Y pour les signatures avec une marge minimale de 30px après le dernier jour
    const signatureY = Math.max(startY + 30, 240);
    
    // Création du tableau principal avec plus d'espace
    doc.rect(signatureStartX, signatureY, signatureWidth, signatureHeight);
    
    // Lignes de séparation verticales
    doc.line(signatureStartX + 37, signatureY, signatureStartX + 37, signatureY + signatureHeight);
    doc.line(signatureStartX + 73, signatureY, signatureStartX + 73, signatureY + signatureHeight);
    
    // Ligne horizontale pour séparer les en-têtes
    doc.line(signatureStartX, signatureY + headerHeight, signatureStartX + signatureWidth, signatureY + headerHeight);
    
    // Texte des en-têtes avec un meilleur espacement
    doc.setFontSize(9);
    
    // Première colonne
    doc.text('Visa Service', signatureStartX + 3, signatureY + 8);
    doc.text('personnel', signatureStartX + 3, signatureY + 13);
    
    // Deuxième colonne
    doc.text('Mois Exploitation', signatureStartX + 40, signatureY + 8);
    doc.text('paie', signatureStartX + 40, signatureY + 13);
    
    // Troisième colonne
    doc.text('Cachet et Signature', signatureStartX + 76, signatureY + 8);
    doc.text('Responsable', signatureStartX + 76, signatureY + 13);
    
    doc.setFontSize(10);
    
   
    
    
    doc.save(`fiche_position_${apprentiId}_${month}_${year}.pdf`);
  };

  const handleDocumentGeneration = () => {
    switch (selectedDocument) {
      case "fichePosition":
        setShowCalendar(true);
        break;
      case "priseEnCharge":
        generatePriseEnCharge(selectedItem);
        break;
      case "attestation":
        generateAttestation(selectedItem);
        break;
      default:
        alert("Veuillez sélectionner un type de document");
    }
  };

  const generatePriseEnCharge = (stageId) => {
      const stage = stages.find(s => s.idStage === parseInt(stageId));
      if (!stage) {
        alert("Stage non trouvé");
        return;
      }
    
      const doc = new jsPDF();
      
      // Cadre du document
      doc.rect(10, 10, 190, 277);
      
      // En-tête avec logo
      doc.addImage(logo, 'PNG', 15, 15, 20, 20);
      
      // En-tête administratif
      doc.setFontSize(10);
      doc.text('DIRECTION GÉNÉRALE', 15, 45);
      doc.text('DIRECTION CENTRALE DIGITALISATION', 15, 50);
      doc.text('ET SYSTEME D\'INFORMATION', 15, 55);
      doc.text('N° _____/SUPP/FOR/DC-DSI/2024', 15, 65);
      
      // Zone photo
      doc.rect(160, 15, 30, 40);
      doc.text('PHOTOS', 170, 35);
      
      // Titre avec fond bleu clair
      doc.setFillColor(200, 230, 250);
      doc.rect(15, 80, 120, 10, 'F'); // Réduit de 140 à 120
      doc.setFontSize(11);
      doc.text('PRISE EN CHARGE STAGE', 45, 87);
      
      // Cases à cocher
      doc.setFontSize(9);
      doc.rect(140, 77, 5, 5);
      doc.text('Avec prise en charge transport', 147, 81);
      doc.rect(140, 84, 5, 5);
      doc.text('Avec prise en charge restauration', 147, 88);
      doc.rect(140, 91, 5, 5);
      doc.text('Sans prise en charge', 147, 95);
      
      // Grand tableau principal
      const startY = 100;
      const tableHeight = 120;
      doc.rect(15, startY, 180, tableHeight);
      
      // Première colonne "Encadrement professionnel" et "Structure ADM"
      doc.setFillColor(240, 240, 240);
      doc.rect(15, startY, 30, tableHeight, 'F');
      doc.text('Encadrement', 17, startY + 35);
      doc.text('professionnel', 17, startY + 42);
      doc.text('Structure', 17, startY + 60);
      doc.text('ADM', 17, startY + 65);
      
      // Ligne verticale séparatrice principale
      doc.line(45, startY, 45, startY + tableHeight);
      
      // Structure du tableau - commence directement dans la deuxième colonne
      let currentY = startY;
      const rowHeight = 10;
      
      // Structure d'encadrement
      doc.text('Structure d\'encadrement', 50, currentY + 7);
      doc.rect(140, currentY + 3, 5, 5);
      doc.text('DC-DSI', 147, currentY + 7);
      
      // Nom et Prénom des stagiaires
      currentY += rowHeight;
      doc.line(45, currentY, 195, currentY); // La ligne commence après la première colonne
      doc.text('Nom et Prénom des stagiaires', 50, currentY + 7);
      doc.rect(140, currentY + 2, 45, 6);
      doc.rect(140, currentY + 9, 45, 6);
      if (stage.stagiaires) {
          doc.text(stage.stagiaires[0] || '', 142, currentY + 6);
          doc.text(stage.stagiaires[1] || '', 142, currentY + 13);
      }
      
      // Thème de stage
      currentY += rowHeight * 2;
      doc.line(15, currentY, 195, currentY);
      doc.text('Thème de stage', 50, currentY + 7);
      doc.text(stage.theme || '', 140, currentY + 7);
      
      // Encadreur
      currentY += rowHeight;
      doc.line(15, currentY, 195, currentY);
      doc.text('Nom de l\'encadreur', 50, currentY + 7);
      doc.text(stage.encadreur || '', 140, currentY + 7);
      doc.text('N° poste', 160, currentY + 7);
      
      // Fonction
      currentY += rowHeight;
      doc.line(15, currentY, 195, currentY);
      doc.text('Fonction de l\'encadreur', 50, currentY + 7);
      doc.text(stage.fonctionEncadreur || '', 140, currentY + 7);
      doc.text('e-mail', 160, currentY + 7);
      
      // Date début et fin
      currentY += rowHeight;
      doc.line(15, currentY, 195, currentY);
      doc.text('Date début et fin de stage', 50, currentY + 7);
      doc.text('Du', 140, currentY + 7);
      doc.text(new Date(stage.dateDebut).toLocaleDateString('fr-FR'), 150, currentY + 7);
      doc.text('Au', 170, currentY + 7);
      doc.text(new Date(stage.dateFin).toLocaleDateString('fr-FR'), 180, currentY + 7);
      
      // Jours de réception
      currentY += rowHeight;
      doc.line(15, currentY, 195, currentY);
      doc.text('Jours de réception', 50, currentY + 7);
      
      // Cases à cocher pour les jours avec plus d'espace vertical
      const joursColonne1 = [
          { text: 'Dimanche', y: 0 },
          { text: 'Lundi', y: 7 },
          { text: 'Mardi', y: 14 }
      ];
      
      const joursColonne2 = [
          { text: 'Mercredi', y: 0 },
          { text: 'Jeudi', y: 7 }
      ];
      
      joursColonne1.forEach(jour => {
          doc.rect(140, currentY + 3 + jour.y, 4, 4);
          doc.text(jour.text, 146, currentY + 6 + jour.y);
      });
      
      joursColonne2.forEach(jour => {
          doc.rect(170, currentY + 3 + jour.y, 4, 4);
          doc.text(jour.text, 176, currentY + 6 + jour.y);
      });
      
      // Après les jours de réception, ajout du visa de la structure ADM
      currentY += rowHeight * 2.5;
      doc.line(15, currentY, 195, currentY);
      doc.text('Visa de la structure ADM', 50, currentY + 7);
      doc.text('d\'encadrement', 50, currentY + 12);
      doc.rect(140, currentY + 2, 45, 15);
      
      // Section logistique - ajustée pour suivre le nouveau tableau
      const logistiqueY = startY + tableHeight + 10;
      doc.rect(15, logistiqueY, 180, 25);
      doc.setFillColor(240, 240, 240);
      doc.rect(15, logistiqueY, 30, 25, 'F');
      doc.text('Prise en charge', 17, logistiqueY + 8);
      doc.text('logistique', 17, logistiqueY + 13);
      
      // Ligne verticale séparatrice pour la section logistique
      doc.line(45, logistiqueY, 45, logistiqueY + 25);
      
      // Département Catering
      doc.text('Visa du Département Catering', 50, logistiqueY + 8);
      
      // Ligne horizontale de séparation entre les départements
      doc.line(45, logistiqueY + 12, 195, logistiqueY + 12);
      
      // Département Transport
      doc.text('Visa du Département Transport', 50, logistiqueY + 20);
      
      // Zone de signature - positionnée après la section logistique
      const signatureY = logistiqueY + 35;
      doc.rect(15, signatureY, 180, 20);
      doc.line(105, signatureY, 105, signatureY + 20);
      
      // Texte de signature
      doc.text('Responsable habilité de la Structure', 17, signatureY + 8);
      doc.text('(de rang de Directeur et plus)', 17, signatureY + 13);
      doc.text('Le Directeur Formation &', 110, signatureY + 8);
      doc.text('Planification RH', 110, signatureY + 13);
      
      doc.save(`prise_en_charge_${stageId}.pdf`);
  };

  const generateAttestation = (stagiaireId) => {
    const stagiaire = stagiaires.find(s => s.idAS === parseInt(stagiaireId));
    if (!stagiaire) {
      alert("Stagiaire non trouvé");
      return;
    }
  
    const stage = stages.find(s => s.idStage === stagiaire.idStage);
    if (!stage) {
      alert("Stage associé non trouvé");
      return;
    }
  
    const doc = new jsPDF();
    const currentDate = new Date();
    
    // En-tête avec logo
    doc.addImage(logo, 'PNG', 10, 10, 20, 20);
    
    // Informations de l'entreprise
    doc.setFontSize(10);
    doc.text('SONATRACH', 10, 35);
    doc.text('ACTIVITE EXPLORATION PRODUCTION', 10, 40);
    doc.text('DIVISION INFORMATIQUE', 10, 45);
    doc.text('N° _____/DIV.INF/DG', 10, 50);
    
    // Titre
    doc.setFontSize(14);
    doc.text('ATTESTATION DE STAGE', 105, 70, { align: 'center' });
    
    // Corps du texte
    doc.setFontSize(11);
    doc.text('Je soussigné, Directeur de la Division Informatique, certifie que :', 20, 90);
    doc.text(`M./Mlle ${stagiaire.nom} ${stagiaire.prenom}`, 20, 100);
    doc.text(`Spécialité : ${stagiaire.specialite}`, 20, 110);
    doc.text('A effectué un stage pratique au niveau de notre Division Informatique, Service', 20, 120);
    doc.text(`Développement Fonction & SI, pendant la période du ${new Date(stage.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stage.dateFin).toLocaleDateString('fr-FR')}`, 20, 130);
    doc.text('Cette attestation est délivrée à l\'intéressé(e) pour servir et valoir ce que de droit.', 20, 150);
    
    // Date et signature
    doc.text(`Fait à Alger, le ${currentDate.toLocaleDateString('fr-FR')}`, 20, 180);
    doc.text('Le Directeur de la Division', 130, 180);
    doc.text('Informatique', 130, 185);
    
    // Ajout du cadre autour du document
    doc.rect(5, 5, 200, 287);
    
    doc.save(`attestation_stage_${stagiaireId}.pdf`);
};

  const renderCalendar = () => {
    if (!showCalendar) return null;

    const currentDate = new Date();
    const today = currentDate.getDate();

    return (
      <div className="calendar-modal-overlay">
        <div className="calendar-modal">
          <div className="calendar-modal-header">
            <h3>Calendrier des présences - {currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
            <button className="close-btn" onClick={() => setShowCalendar(false)}>×</button>
          </div>
          <div className="calendar-modal-content">
            <table className="presence-table">
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>État</th>
                  <th>Observation</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: today }, (_, i) => i + 1).map(day => (
                  <tr key={day}>
                    <td>{day} {currentDate.toLocaleString('fr-FR', { month: 'long' })}</td>
                    <td>
                      <select
                        value={presenceData[day]?.etat || 'present'}
                        onChange={(e) => setPresenceData(prev => ({
                          ...prev,
                          [day]: {
                            ...prev[day],
                            etat: e.target.value,
                            observation: prev[day]?.observation || ''
                          }
                        }))}
                        className="presence-select"
                      >
                        <option value="present">P</option>
                        <option value="absent">AA</option>
                        <option value="conge">F</option>
                        <option value="mission">RH</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={presenceData[day]?.observation || ''}
                        onChange={(e) => setPresenceData(prev => ({
                          ...prev,
                          [day]: {
                            ...prev[day],
                            etat: prev[day]?.etat || 'present',
                            observation: e.target.value
                          }
                        }))}
                        placeholder="Ajouter une note..."
                        className="observation-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="calendar-modal-footer">
            <button className="cancel-btn" onClick={() => setShowCalendar(false)}>
              Annuler
            </button>
            <button className="submit-btn" onClick={handleCalendarSubmit}>
              Générer le document
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="documents-container">
      <div className="documents-card">
        <div className="documents-header">
          <h2 className="documents-title">
            <i className="fas fa-file-alt"></i> 
            Génération de Documents Administratifs
          </h2>
          <div className="header-actions">
            <button 
              className="refresh-btn"
              onClick={refreshData}
              title="Rafraîchir les listes"
            >
              <i className="fas fa-sync-alt"></i>
              Actualiser
            </button>
          </div>
        </div>

        <div className="documents-form">
          <div className="form-group">
            <label htmlFor="documentType" className="form-label">
              <i className="fas fa-file-signature"></i>
              Type de document administratif
            </label>
            <select
              className="form-select"
              id="documentType"
              value={selectedDocument}
              onChange={(e) => {
                setSelectedDocument(e.target.value);
                setSelectedItem("");
              }}
            >
              <option value="">-- Sélectionnez un type de document --</option>
              <option value="priseEnCharge">Prise en charge </option>
              <option value="attestation">Attestation de stage</option>
              <option value="fichePosition">Fiche de position </option>
            </select>
          </div>

          {renderSecondSelect()}

          <div className="form-actions">
            <button
              className="generate-btn"
              onClick={handleDocumentGeneration}
              disabled={!selectedDocument || !selectedItem}
            >
              <i className="fas fa-file-pdf"></i>
              Générer le document
            </button>
          </div>
        </div>
      </div>
      {renderCalendar()}
    </div>
  );
}

export default DocumentsGeneration;

