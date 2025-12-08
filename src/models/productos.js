const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const { STATUS } = require('../config/constants');

const Producto = sequelize.define('productos', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  descripcion: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  id_rubro: {
    type: Sequelize.BIGINT,
    allowNull: false,
    field: 'id_rubro'
  },
  sku: {
    type: Sequelize.STRING(50),
    unique: true,
    allowNull: true
  },
  codigo: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  codigo_barra: {
    type: Sequelize.STRING(50),
    allowNull: true,
    unique: true
  },
  precio_compra: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  precio_venta: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  costo_promedio: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  stock: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  stock_minimo: {
    type: Sequelize.INTEGER,
    defaultValue: 5,
    validate: {
      min: 0
    }
  },
  unidad: {
    type: Sequelize.STRING(20),
    allowNull: true,
    defaultValue: 'unidad'
  },
  marca: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  talla: {
    type: Sequelize.STRING(20),
    allowNull: true
  },
  color: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  ubicacion: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  fecha_vencimiento: {
    type: Sequelize.DATEONLY,
    allowNull: true
  },
  lote: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  imagen_url: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  es_servicio: {
    type: Sequelize.TINYINT,
    defaultValue: 0
  },
  proveedor_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  status: {
    type: Sequelize.TINYINT,
    allowNull: false,
    defaultValue: STATUS.ACTIVO
  }
  /*,
  descripcion_detalle: {
    type: Sequelize.TEXT,
    allowNull: true
  }*/
}, {
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['id_rubro'] },
    { fields: ['codigo_barra'] },
    { fields: ['sku'] },
    { fields: ['stock'] },
    { fields: ['status'] },
    { fields: ['nombre'] }
  ]
});

// Métodos de instancia
Producto.prototype.hasStock = function (cantidad) {
  return this.stock >= cantidad;
};

Producto.prototype.isLowStock = function () {
  return this.stock <= this.stock_minimo && this.stock > 0;
};

Producto.prototype.isOutOfStock = function () {
  return this.stock === 0;
};

Producto.prototype.calcularUtilidad = function () {
  return this.precio_venta - (this.costo_promedio || this.precio_compra || 0);
};

Producto.prototype.calcularMargenUtilidad = function () {
  const utilidad = this.calcularUtilidad();
  return this.precio_venta > 0 ? (utilidad / this.precio_venta) * 100 : 0;
};

// No sincronizar aquí, se hará desde models/index.js
module.exports = Producto;
