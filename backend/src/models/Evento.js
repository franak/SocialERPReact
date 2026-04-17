const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const eventoSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
        index: true,
    },
    claveEmpleado: {
        type: String,
        required: true,
        index: true,
    },
    tipoEvento: {
        type: String,
        required: true,
        enum: ['Vacaciones', 'Baja Laboral', 'Ausencia'],
    },
    estado: {
        type: String,
        required: true,
        enum: ['Incompleta', 'Pendiente', 'En Curso', 'Procesada', 'No procesable', 'Rechazada'],
        default: 'Pendiente',
    },
    fechaInicio: {
        type: Date,
        required: true,
    },
    fechaFin: {
        type: Date,
        required: true,
    },
    descripcion: {
        type: String,
        default: '',
    },
    // ICS-like standard fields for future interoperability
    summary: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
    // Custom fields — extensible key-value store for future custom data
    customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true, // createdAt, updatedAt
});

// Index for efficient queries by employee + date range
eventoSchema.index({ claveEmpleado: 1, fechaInicio: 1, fechaFin: 1 });

module.exports = mongoose.model('Evento', eventoSchema);
