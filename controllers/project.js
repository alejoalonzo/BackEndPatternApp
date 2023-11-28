"use strict";
const project = require("../models/project");
const config = require("../global");
const nodemailer = require("nodemailer");
const Project = require("../models/project");
var fs = require("fs");
const { exists } = require("../models/project");
const contact = require("../models/contact");
var Contact = require("../models/contact");
var path = require("path");

var controller = {
  home: function (req, res) {
    return res.status(200).send({
      message: "Soy la home",
    });
  },
  test: function (req, res) {
    return res.status(200).send({
      message: "Soy el metodo o accion test del controlador Project",
    });
  },

  //*******************************************************CONTACT********************************************************

  //password= cslmvqfcjerbykkj
  homeContact: function (req, res) {
    return res.status(200).send({
      message: "Soy la home del backend de contacto",
    });
  },
  saveContact: function (req, res) {
    var contact = new Contact();

    var params = req.body;
    contact.name = params.name;
    contact.email = params.email;
    contact.subject = params.subject;
    contact.message = params.message;

    //Guardar enb la base de datos
    contact.save((err, contactStored) => {
      if (err) {
        return res
          .status(500)
          .send({ message: "Error al guardar el contacto" });
      }
      if (!contactStored) {
        return res
          .status(404)
          .send({ message: "No se ha podido guardar el contacto" });
      }

      // Send email
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: config.email, // generated ethereal user
          pass: config.emailPassword, // generated ethereal password
        },
        tls: {
          rejectUnauthorized: false, //Exchange for the SSL(following)
        },
        //tls: {
        //ca: fs.readFileSync('/path/to/ca.pem'), // path to the CA certificate
        //},
      });
      console.log("Client email:", contact.email);
      const mailOptions = {
        from: '"Alejo 👻" <' + config.emailPassword + ">",
        to: config.email,
        subject: contact.subject,
        text: `Email from: ${contact.email}\n\n${contact.message}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      return res.status(200).send({ contact: contactStored });
    });

    /*Pueba en postman
        return res.status(200).send({
          //params: params,
          project: project,
          message: "Nuevo proyecto ok",
        });*/
  },

  //*******************************************************CRUD********************************************************

  //--------------------Create---------------------------------------------------------------------------------------
  saveProject: async function (req, res) {
    try {
      var project = new Project();

      var params = req.body;
      project.name = params.name;
      project.description = params.description;
      project.category = params.category;
      project.langs = params.langs;
      project.image = null;
      project.repository = params.repository;
      project.preview = params.preview;

      // Save in the database
      const projectStored = await project.save();

      if (!projectStored) {
        return res.status(404).send({ message: "Project did not save" });
      }

      return res.status(200).send({ project: projectStored });
    } catch (err) {
      return res
        .status(500)
        .send({ message: "Error while saving  the project" });
    }
  },

  //---------------------------------------------Read--------------------------------------------------
  getProject: async function (req, res) {
    try {
      var projectId = req.params.id;
      if (projectId == null)
        return res.status(404).send({ message: "Do not get the project" });

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).send({ message: "Do not get the project" });
      }

      return res.status(200).send({ project });
    } catch (err) {
      return res.status(500).send({ message: "Error, Do not get the project" });
    }
  },

  getProjects: async function (req, res) {
    try {
      const projects = await Project.find({
        /*filtrar búsqueda, parámetro aquí, como un WHERE*/
      }).exec();

      if (!projects || projects.length === 0) {
        return res.status(404).send({ message: "Do not listed the projects" });
      }

      return res.status(200).send({ projects });
    } catch (err) {
      return res
        .status(500)
        .send({ message: "Error, Do not listed the projects" });
    }
  },

  //---------------------------------------------Update--------------------------------------------------
  updateProject: async function (req, res) {
    try {
      var projectId = req.params.id;
      var update = req.body; //got the query

      const projectUpdated = await Project.findByIdAndUpdate(
        projectId,
        update,
        { new: true }
      );

      if (!projectUpdated) {
        return res.status(404).send({ message: "Project did not uploades" });
      }

      return res.status(200).send({ projectUpdated });
    } catch (err) {
      return res
        .status(500)
        .send({ message: "Error while uploading  the project" });
    }
  },

  //---------------------------------------------Delete--------------------------------------------------
  deleteProject: async function (req, res) {
    try {
      var projectId = req.params.id;

      const projectRemoved = await Project.findOneAndDelete({ _id: projectId });

      if (!projectRemoved) {
        return res.status(404).send({ message: "Not Found or Deleted" });
      }

      // Eliminar el archivo asociado al proyecto
      const filePath = `uploads/${projectRemoved.image}`; // path image project

      fs.unlink(filePath, err => {
        if (err) {
          console.error("Error, project is not deleted:", err);
        } else {
          console.log("File is deleted succesfuly");
        }
      });

      return res.status(200).send({ project: projectRemoved });
    } catch (err) {
      return res.status(500).send({ message: "Error, project is not deleted" });
    }
  },

  //---------------------------------------------Imgs--------------------------------------------------
  uploadImg: async function (req, res) {
    try {
      var projectId = req.params.id;
      var fileName = "Image does not upload";

      if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split("\\");
        var fileName = fileSplit[1];
        var extSplit = fileName.split(".");
        var fileExt = extSplit[1];

        if (
          fileExt == "png" ||
          fileExt == "jpg" ||
          fileExt == "jpeg" ||
          fileExt == "gif"
        ) {
          const projectUpdated = await Project.findByIdAndUpdate(
            projectId,
            { image: fileName },
            { new: true }
          );

          if (!projectUpdated) {
            return res
              .status(404)
              .send({ message: "The image does not upload" });
          }

          return res.status(200).send({ project: projectUpdated });
        } else {
          fs.unlink(filePath, err => {
            return res.status(200).send({ message: "Wrong extension" });
          });
        }
      } else {
        return res.status(200).send({ message: fileName });
      }
    } catch (err) {
      return res.status(500).send({ message: "Error image upload" });
    }
  },

  //---------------------------------------------Get Image--------------------------------------------------
  getImageFile: function (req, res) {
    var file = req.params.image;
    var path_file = "./uploads/" + file;

    fs.access(path_file, fs.constants.F_OK, err => {
      if (err) {
        return res.status(200).send({ message: "The image doesn't exist" });
      } else {
        return res.sendFile(path.resolve(path_file));
      }
    });
  },
  //---------------------------------------------OpenAI KEY--------------------------------------------------
  getOpenAI: function (req, res) {
    if (!config.OPENAI_API_KEY) {
      return res
        .status(404)
        .send({ message: "API KEY OPENAI IS NOT AVAILABLE" });
    }
    return res.status(200).send({ key: config.OPENAI_API_KEY });
  },
};

module.exports = controller;
