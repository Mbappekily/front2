import React, { useState, useEffect } from "react";
import "../form/form.css";

function StageForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    idStage: "",
    dateDebut: "",
    dateFin: "",
    duree: "",
    jourDeRecep: [], // Initialiser comme tableau vide
    typeDePC: [],    // Initialiser comme tableau vide
    type: "",
    idDirection: "",
    idEncd: "",
    idTheme: "",
    titre: ""
  });

  const [directions, setDirections] = useState([]);
  const [encadrants, setEncadrants] = useState([]);
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/themes")
      .then((res) => res.json())
      .then((data) => setThemes(data))
      .catch((err) => console.error("Erreur lors du chargement des thèmes :", err));
  }, []);
  
  useEffect(() => {
    fetch("http://localhost:8080/encadrants")
      .then((res) => res.json())
      .then((data) => setEncadrants(data))
      .catch((err) => console.error("Erreur lors du chargement des encadrants :", err));
  }, []);
  
  useEffect(() => {
    fetch("http://localhost:8080/directions")
      .then((res) => res.json())
      .then((data) => setDirections(data))
      .catch((err) => console.error("Erreur lors du chargement des directions :", err));
  }, []);
  
  // Initialiser le formulaire avec les données existantes pour modification
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        jourDeRecep: initialData.jourDeRecep ? initialData.jourDeRecep.split(',') : [],
        typeDePC: initialData.typeDePC ? initialData.typeDePC.split(',') : [],
        idEncd: initialData.idEncd || "",
        idTheme: initialData.idTheme || "",
        titre: initialData.titre || ""
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    if (e.target.name === "idTheme") {
      const selectedThemeId = e.target.value;
      const selectedTheme = themes.find(theme => theme.idTheme == selectedThemeId);
      
      setFormData({ 
        ...formData, 
        idTheme: selectedThemeId,
        titre: selectedTheme ? selectedTheme.titre : "" 
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const action = initialData ? "modifier" : "ajouter";
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} ce stage ?`)) {
      return;
    }
  
    try {
      const payload = {
        ...formData,
        jourDeRecep: formData.jourDeRecep.join(','),
        typeDePC: formData.typeDePC.join(','),
        idDirection: undefined,
        idEncd: undefined,
        idTheme: undefined,
        direction: formData.idDirection ? { idDirection: formData.idDirection } : null,
        encadrant: formData.idEncd ? { idEncd: formData.idEncd } : null,
        theme: formData.idTheme ? { idTheme: formData.idTheme } : null,
        titre: formData.titre // Ajout du titre dans le payload
      };

      console.log("Final payload:", payload); 

      const url = initialData 
        ? `http://localhost:8080/stages/${initialData.idAS}`
        : "http://localhost:8080/stages";
  
      const method = initialData ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(`Stage ${initialData ? "modifié" : "ajouté"} avec succès:`, data);
        onSubmit(data);
        
        if (window.confirm(`Stage ${initialData ? "modifié" : "ajouté"} avec succès! Actualiser la page ?`)) {
          window.location.reload();
        }
      } else {
        const errorText = await response.text();
        console.error("Erreur lors de l'envoi:", errorText);
        alert(`Erreur: ${errorText}`);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur de connexion au serveur. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        {/* En-tête de formulaire avec l'icône X de fermeture */}
        <div className="form-app-header">
          <h2>{initialData ? "Modifier un stage" : "Ajouter un stage"}</h2>
          <button type="button" className="close-tab-button" onClick={onCancel} aria-label="Fermer">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {initialData && (
              <input type="hidden" name="idStage" value={formData.idStage} />
            )}

            <div className="form-group">
              <label>Date de Début :</label>
              <input
                type="date"
                name="dateDebut"
                className="form-input"
                value={formData.dateDebut}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date de Fin :</label>
              <input
                type="date"
                name="dateFin"
                className="form-input"
                value={formData.dateFin}
                onChange={handleChange}
              />
            </div>

            <div className="form-group"> 
              <label>Jours de Réception :</label>
              <div className="form-checkbox-group">
                {["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"].map((jour) => (
                  <label key={jour} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={jour}
                      checked={formData.jourDeRecep.includes(jour)}
                      onChange={(e) => {
                        const selected = formData.jourDeRecep.includes(jour)
                          ? formData.jourDeRecep.filter((j) => j !== jour)
                          : [...formData.jourDeRecep, jour];
                        setFormData({ ...formData, jourDeRecep: selected });
                      }}
                    />
                    {jour}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Type de Prise en Charge :</label>
              <div className="form-checkbox-group">
                {["Transport", "Restauration", "Aucune"].map((type) => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={type}
                      checked={formData.typeDePC.includes(type)}
                      onChange={(e) => {
                        const selected = formData.typeDePC.includes(type)
                          ? formData.typeDePC.filter((t) => t !== type)
                          : [...formData.typeDePC, type];
                        setFormData({ ...formData, typeDePC: selected });
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Type :</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">- Sélectionner le type -</option>
                <option value="Stage Pratique">Stage Pratique</option>
                <option value="Stage PFE">Stage PFE</option>
              </select>
            </div>

            <div className="form-group">
              <label>Direction :</label>
              <select
                name="idDirection"
                className="form-select"
                value={formData.idDirection}
                onChange={handleChange}
              >
                <option value="">-- Sélectionner une direction --</option>
                {directions.map((dir) => (
                  <option key={dir.idDirection} value={dir.idDirection}>
                    {dir.designation}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Encadrant :</label>
              <select
                name="idEncd"
                className="form-select"
                value={formData.idEncd}
                onChange={handleChange}
              >
                <option value="">-- Sélectionner un encadrant --</option>
                {encadrants.map((enca) => (
                  <option key={enca.idEncd} value={enca.idEncd}>
                    {enca.nom} {enca.prenom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Thème :</label>
              <select
                name="idTheme"
                className="form-select"
                value={formData.idTheme}
                onChange={handleChange}
              >
                <option value="">-- Sélectionner un thème --</option>
                {themes.map((theme) => (
                  <option key={theme.idTheme} value={theme.idTheme}>
                    {theme.titre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              {initialData ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StageForm;