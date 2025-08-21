/**
 * Admin Players Management
 */

import React, { useMemo, useState } from "react";
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
  useGetPlayersQuery,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
} from "../../../src/store/api/slices/playersApi";
import type { Player } from "../../../src/types/database";
import { COLORS } from "../../../src/config/constants";

export default function AdminPlayersScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetPlayersQuery();
  const [query, setQuery] = useState("");
  const [createPlayer, { isLoading: creating }] = useCreatePlayerMutation();
  const [updatePlayer, { isLoading: updating }] = useUpdatePlayerMutation();
  const [deletePlayer, { isLoading: deleting }] = useDeletePlayerMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<Player | null>(null);
  const [nameField, setNameField] = useState("");
  const [handicap, setHandicap] = useState<string>("");

  const openCreate = () => {
    setEditingId(null);
    setNameField("");
    setHandicap("");
    setModalOpen(true);
  };
  const openEdit = (p: Player) => {
    setEditingId(p.id);
    setNameField(p.name || "");
    setHandicap((p.handicap ?? "").toString());
    setModalOpen(true);
  };
  const submit = async () => {
    if (!nameField) return;
    try {
      if (editingId) {
        await updatePlayer({
          id: editingId,
          updates: {
            name: nameField,
            handicap: handicap === "" ? undefined : Number(handicap),
          },
        }).unwrap();
      } else {
        await createPlayer({
          name: nameField,
          handicap: handicap === "" ? undefined : Number(handicap),
        }).unwrap();
      }
      setModalOpen(false);
      setNameField("");
      setHandicap("");
      refetch();
    } catch {}
  };

  const handleDelete = (item: Player) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deletePlayer(deletingItem.id).unwrap();
      setDeleteModalOpen(false);
      setDeletingItem(null);
      refetch();
    } catch {}
  };

  const filtered = useMemo(() => {
    if (!data) return [] as Player[];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [data, query]);

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
        <Text style={styles.headerTitle}>Manage Players</Text>
      </View>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={openCreate}
        accessibilityLabel="Create player"
      >
        <Ionicons name="add" size={22} color={COLORS.PRIMARY} />
      </TouchableOpacity>
    </View>
  );

  const renderSearch = () => (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={18} color="#999" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search players..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => setQuery("")}>
          <Ionicons name="close-circle" size={18} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: Player }) => (
    <View style={styles.row}>
      <View style={styles.avatarSm}>
        <Ionicons name="person" size={16} color={COLORS.PRIMARY} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.name}
        </Text>
        {!!item.team?.name && (
          <Text style={styles.rowSub}>{item.team?.name}</Text>
        )}
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity
          style={styles.rowAction}
          onPress={() => openEdit(item)}
          accessibilityLabel="Edit player"
        >
          <Ionicons name="create-outline" size={18} color="#616161" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rowAction, styles.deleteAction]}
          onPress={() => handleDelete(item)}
          accessibilityLabel="Delete player"
        >
          <Ionicons name="trash-outline" size={18} color="#d32f2f" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.toolbar}>{renderSearch()}</View>
      <FlatList
        data={filtered}
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
                {editingId ? "Edit Player" : "Create Player"}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={nameField}
                onChangeText={setNameField}
                placeholder="Player name"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Handicap (optional)</Text>
              <TextInput
                style={styles.input}
                value={handicap}
                onChangeText={setHandicap}
                placeholder="e.g. 2"
                keyboardType="number-pad"
              />
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submit}
              disabled={creating || updating || !nameField}
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
              <Text style={styles.deleteModalTitle}>Delete Player</Text>
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
  toolbar: { paddingHorizontal: 12, paddingTop: 8 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: "#333" },
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
  avatarSm: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
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
