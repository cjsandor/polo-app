/**
 * Admin Fields Management
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeModal } from "../../../src/components/ui/SafeModal";
import {
  useGetFieldsQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useDeleteFieldMutation,
} from "../../../src/store/api/slices/fieldsApi";
import type { Field } from "../../../src/types/database";
import { COLORS } from "../../../src/config/constants";

export default function AdminFieldsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetFieldsQuery();
  const [createField, { isLoading: creating }] = useCreateFieldMutation();
  const [updateField, { isLoading: updating }] = useUpdateFieldMutation();
  const [deleteField, { isLoading: deleting }] = useDeleteFieldMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<Field | null>(null);
  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [location, setLocation] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setClub("");
    setLocation("");
  };
  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };
  const openEdit = (f: Field) => {
    setEditingId(f.id);
    setName(f.name || "");
    setClub(f.club || "");
    setLocation(f.location || "");
    setModalOpen(true);
  };
  const submit = async () => {
    if (!name) return;
    try {
      if (editingId) {
        await updateField({
          id: editingId,
          updates: {
            name,
            club: club || undefined,
            location: location || undefined,
          },
        }).unwrap();
      } else {
        await createField({
          name,
          club: club || undefined,
          location: location || undefined,
        }).unwrap();
      }
      setModalOpen(false);
      resetForm();
      refetch();
    } catch {}
  };

  const handleDelete = (item: Field) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteField(deletingItem.id).unwrap();
      setDeleteModalOpen(false);
      setDeletingItem(null);
      refetch();
    } catch {}
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.replace("/(app)/(tabs)/admin")}
          accessibilityLabel="Back to Admin"
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Fields</Text>
      </View>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={openCreate}
        accessibilityLabel="Create field"
      >
        <Ionicons name="add" size={22} color={COLORS.PRIMARY} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Field }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.name}
        </Text>
        {!!item.location && <Text style={styles.rowSub}>{item.location}</Text>}
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity
          style={styles.rowAction}
          onPress={() => openEdit(item)}
          accessibilityLabel="Edit field"
        >
          <Ionicons name="create-outline" size={18} color="#616161" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rowAction, styles.deleteAction]}
          onPress={() => handleDelete(item)}
          accessibilityLabel="Delete field"
        >
          <Ionicons name="trash-outline" size={18} color="#d32f2f" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={data || []}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      />
      <SafeModal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Field" : "Create Field"}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Field name"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Club (optional)</Text>
              <TextInput
                style={styles.input}
                value={club}
                onChangeText={setClub}
                placeholder="Club"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Location (optional)</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Location"
              />
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submit}
              disabled={creating || updating || !name}
            >
              <Ionicons name="save" size={18} color="#fff" />
              <Text style={styles.submitText}>
                {editingId ? "Save Changes" : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeModal>

      <SafeModal
        visible={deleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalOpen(false)}
      >
        <View style={styles.deleteModalBackdrop}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteModalContent}>
              <Ionicons name="warning" size={48} color="#d32f2f" />
              <Text style={styles.deleteModalTitle}>Delete Field</Text>
              <Text style={styles.deleteModalText}>
                Are you sure you want to delete "{deletingItem?.name}"?{"\n"}
                This action cannot be undone.
              </Text>
            </View>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalOpen(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={confirmDelete}
                disabled={deleting}
              >
                <Text style={styles.deleteButtonText}>
                  {deleting ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#212121" },
  list: { padding: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  rowTitle: { fontSize: 14, fontWeight: "700", color: "#212121" },
  rowSub: { fontSize: 12, color: "#757575", marginTop: 2 },
  rowActions: {
    flexDirection: "row",
    gap: 8,
  },
  rowAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAction: {
    backgroundColor: "#ffebee",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#212121" },
  formField: { marginBottom: 10 },
  label: { fontSize: 12, color: "#666", marginBottom: 6 },
  input: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: "#333",
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  submitText: { color: "#fff", fontWeight: "800", marginLeft: 6 },
  deleteModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  deleteModalContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginTop: 12,
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#d32f2f",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
