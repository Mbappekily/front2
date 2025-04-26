import React, { useState, useEffect } from "react";
import "../form/form.css";

function EncadreursForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    idEncd: "",
    nom: "",
    prenom: "",
    poste: "",
    fonction: "",
    email: "",
    idEmp: ""
  });

    const [employes, setEmployes] = useState([]);
  

  // Initialiser le formulaire avec les données existantes pour modification
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Assurez-vous que toutes les propriétés nécessaires sont présentes
        idEncd: initialData.idEncd || "",
        nom: initialData.nom || "",
        prenom: initialData.prenom || "",
        poste: initialData.poste || "",
        fonction: initialData.fonction || "",
        email: initialData.email || "",
      });
    }
  }, [initialData]);

 useEffect(() => {
    fetch("http://localhost:8080/employes") // 🛠️ À adapter si ton endpoint est différent
      .then((res) => res.json())
      .then((data) => setEmployes(data))
      .catch((err) => console.error("Erreur lors du chargement des employés:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const action = initialData ? "modifier" : "ajouter";
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cet encadrant ?`)) {
      return;
    }
  
    try {
      // Préparer les données à envoyer avec les bons formats d'ID
    /*  const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        dateN: formData.dateN,
        numTel: formData.numTel,
        type: formData.type,
        email: formData.email,
        niveauEtude: formData.niveauEtude,
        stage: formData.idStage ? { idStage: formData.idStage } : null,
        etablissement: formData.idEtab ? { idEtab: formData.idEtab } : null,
        specialite: formData.idspecialite ? { idspecialite: formData.idspecialite } : null // Note lowercase "s" in idspecialite
      };
            
      console.log("Final payload:", payload); */

      const payload = {
        ...formData,
        employe: { idEmp: formData.idEmp } // 🔗 lien vers l'employé
      };

      const url = initialData 
        ? `http://localhost:8080/encadrants/${initialData.idEncd}`
        : "http://localhost:8080/encadrants";
  
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
        console.log(`Encadrant ${initialData ? "modifié" : "ajouté"} avec succès:`, data);
        onSubmit(data);
        
        if (window.confirm(`Encadrant ${initialData ? "modifié" : "ajouté"} avec succès! Actualiser la page ?`)) {
          window.location.reload();
        } else {
          // Note: setShowForm is not defined in this component
          // You should either add it or remove this line
          // setShowForm(false);
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
        <h3>Veuillez saisir les informations de l'encadreur</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Ajout d'un champ caché pour l'ID si on est en mode édition */}
            {initialData && (
              <input type="hidden" name="idEncd" value={formData.idEncd} />
            )}
            
            
            <div className="form-group">
              <label>Nom :</label>
              <input 
                type="text" 
                name="nom" 
                className="form-input"
                placeholder="Entrer le nom" 
                required 
                value={formData.nom} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label>Prénom :</label>
              <input 
                type="text" 
                name="prenom" 
                className="form-input"
                placeholder="Entrer le prénom" 
                required 
                value={formData.prenom} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label>Poste :</label>
              <input 
                type="text" 
                name="poste" 
                className="form-input"
                placeholder="Entrer le poste" 
                required 
                value={formData.poste} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label>Fonction :</label>
              <input 
                type="text" 
                name="fonction" 
                className="form-input"
                placeholder="Entrer la fonction" 
                required 
                value={formData.fonction} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label>E-mail :</label>
              <input 
                type="email" 
                name="email" 
                className="form-input"
                placeholder="Entrer l'e-mail" 
                required 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
          </div>


          <div className="form-group">
            <label>Employé :</label>
            <select
              name="idEmp"
              className="form-select"
              value={formData.idEmp}
              onChange={handleChange}
              //required
            >
              <option value="">- Sélectionner un employé -</option>
              {employes.map((emp) => (
                <option key={emp.idEmp} value={emp.idEmp}>
                  {emp.nom} {emp.prenom} — {emp.poste}
                </option>
              ))}
            </select>
          </div> 

          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              {initialData ? "Modifier" : "Ajouter"}
            </button>
            {onCancel && (
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EncadreursForm;