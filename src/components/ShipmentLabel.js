import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Création des styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    width: 150,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  barcode: {
    marginTop: 20,
    alignItems: 'center',
  },
  footer: {
    marginTop: 30,
    borderTop: 1,
    paddingTop: 10,
    fontSize: 10,
    textAlign: 'center',
  },
});

// Composant pour le bordereau de colis
const ShipmentLabel = ({ shipment }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Bordereau d'Expédition</Text>
        <Text>COLIS - Service de Livraison</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>N° de Suivi:</Text>
          <Text style={styles.value}>{shipment.tracking_number}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date de Création:</Text>
          <Text style={styles.value}>
            {new Date(shipment.created_at).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Statut:</Text>
          <Text style={styles.value}>{shipment.status}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Origine:</Text>
          <Text style={styles.value}>{shipment.origin}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Destination:</Text>
          <Text style={styles.value}>{shipment.destination}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Poids:</Text>
          <Text style={styles.value}>{shipment.weight} kg</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{shipment.description}</Text>
        </View>

        <View style={styles.barcode}>
          <Text>{shipment.tracking_number}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Ce document doit être collé sur le colis de manière visible</Text>
        <Text>COLIS - Service de Livraison Express</Text>
      </View>
    </Page>
  </Document>
);

export default ShipmentLabel; 