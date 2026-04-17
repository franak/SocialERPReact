const Evento = require('../models/Evento');

/**
 * GET /api/calendario?claveEmpleado=xxx
 * Returns all calendar events for a specific employee
 */
const getEventos = async (req, res) => {
    try {
        const { claveEmpleado } = req.query;

        if (!claveEmpleado) {
            return res.status(400).json({
                status: 'KO',
                message: 'claveEmpleado is required',
            });
        }

        const eventos = await Evento.find({ claveEmpleado }).sort({ fechaInicio: 1 });

        return res.status(200).json({
            status: 'ok',
            data: eventos,
        });
    } catch (error) {
        console.error('getEventos error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al obtener eventos',
        });
    }
};

/**
 * POST /api/calendario
 * Creates a new calendar event
 */
const createEvento = async (req, res) => {
    try {
        const {
            claveEmpleado,
            tipoEvento,
            fechaInicio,
            fechaFin,
            descripcion,
            summary,
            location,
            estado,
            customFields,
        } = req.body;

        // Validation
        if (!claveEmpleado || !tipoEvento || !fechaInicio || !fechaFin) {
            return res.status(400).json({
                status: 'KO',
                message: 'claveEmpleado, tipoEvento, fechaInicio, and fechaFin are required',
            });
        }

        const evento = new Evento({
            claveEmpleado,
            tipoEvento,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            descripcion: descripcion || '',
            summary: summary || tipoEvento,
            location: location || '',
            estado: estado || 'Pendiente',
            customFields: customFields || {},
        });

        await evento.save();

        return res.status(201).json({
            status: 'ok',
            data: evento,
        });
    } catch (error) {
        console.error('createEvento error:', error);
        if (error.code === 11000) {
            return res.status(409).json({
                status: 'KO',
                message: 'Duplicate event UUID',
            });
        }
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al crear evento',
        });
    }
};

/**
 * PUT /api/calendario/:uuid
 * Updates an existing calendar event
 */
const updateEvento = async (req, res) => {
    try {
        const { uuid } = req.params;
        const updates = req.body;

        // Don't allow changing uuid or claveEmpleado
        delete updates.uuid;
        delete updates.claveEmpleado;

        if (updates.fechaInicio) updates.fechaInicio = new Date(updates.fechaInicio);
        if (updates.fechaFin) updates.fechaFin = new Date(updates.fechaFin);

        const evento = await Evento.findOneAndUpdate(
            { uuid },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!evento) {
            return res.status(404).json({
                status: 'KO',
                message: 'Evento no encontrado',
            });
        }

        return res.status(200).json({
            status: 'ok',
            data: evento,
        });
    } catch (error) {
        console.error('updateEvento error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al actualizar evento',
        });
    }
};

/**
 * DELETE /api/calendario/:uuid
 * Deletes a calendar event
 */
const deleteEvento = async (req, res) => {
    try {
        const { uuid } = req.params;

        const evento = await Evento.findOneAndDelete({ uuid });

        if (!evento) {
            return res.status(404).json({
                status: 'KO',
                message: 'Evento no encontrado',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Evento eliminado',
        });
    } catch (error) {
        console.error('deleteEvento error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al eliminar evento',
        });
    }
};

/**
 * GET /api/admin/calendarios
 * Returns all calendar events for all employees (admin only)
 */
const getAllEventos = async (req, res) => {
    try {
        const { claveEmpleado, estado, tipoEvento } = req.query;

        const filter = {};
        if (claveEmpleado) filter.claveEmpleado = claveEmpleado;
        if (estado) filter.estado = estado;
        if (tipoEvento) filter.tipoEvento = tipoEvento;

        const eventos = await Evento.find(filter)
            .sort({ claveEmpleado: 1, fechaInicio: 1 })
            .select('-customFields'); // Don't send custom fields in list view

        return res.status(200).json({
            status: 'ok',
            data: eventos,
        });
    } catch (error) {
        console.error('getAllEventos error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al obtener eventos',
        });
    }
};

module.exports = {
    getEventos,
    createEvento,
    updateEvento,
    deleteEvento,
    getAllEventos,
};
