package com.university.course;

public class Course {
    private int id;
    private String code;
    private String name;
    private String description;
    private int credits;
    private int hours;
    private String filiere;
    private String niveau;
    private Integer enseignantId; // optional teacher id
    private String salle; // room

    public Course() {}

    public Course(int id, String code, String name, String description, int credits, int hours,
                  String filiere, String niveau, Integer enseignantId, String salle) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.credits = credits;
        this.hours = hours;
        this.filiere = filiere;
        this.niveau = niveau;
        this.enseignantId = enseignantId;
        this.salle = salle;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public int getHours() { return hours; }
    public void setHours(int hours) { this.hours = hours; }

    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }

    public String getNiveau() { return niveau; }
    public void setNiveau(String niveau) { this.niveau = niveau; }

    public Integer getEnseignantId() { return enseignantId; }
    public void setEnseignantId(Integer enseignantId) { this.enseignantId = enseignantId; }

    public String getSalle() { return salle; }
    public void setSalle(String salle) { this.salle = salle; }
}
