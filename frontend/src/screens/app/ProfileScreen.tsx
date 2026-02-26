import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { ThemeMode, useThemeStore } from '../../store/theme.store';
import { useUserProfileStore } from '../../store/userProfile.store';
import { BRAZIL_UFS } from '../../constants/ufs';
import { hasImagePickerSupport, pickImageFromLibrary, takePhotoWithCamera } from '../../services/imagePicker';
import {
  LogoutButton,
  ProfileCard,
  ProfileChips,
  ProfileHeader,
  ProfileRow,
  ProfileSectionTitle,
  ProfileToggleRow,
} from '../../components/profile';
import { AppText, ScreenBackground } from '../../components/ui';

type ActiveModal = 'avatar' | 'name' | 'parties' | 'states' | 'theme' | null;

const PARTY_OPTIONS_BASE = [
  'PT', 'PL', 'PSDB', 'MDB', 'PSD', 'PP', 'UNIÃO', 'PSB', 'PDT', 'REPUBLICANOS', 'PODE', 'PSOL', 'NOVO',
];

const UF_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba',
  PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

function asChipSummary(items: string[], formatter?: (value: string) => string) {
  if (items.length <= 3) {
    return items.map((item) => (formatter ? formatter(item) : item));
  }
  const visible = items.slice(0, 3).map((item) => (formatter ? formatter(item) : item));
  return [...visible, `+${items.length - 3} mais`];
}

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const authName = useAuthStore((state) => state.user?.name ?? '');
  const authEmail = useAuthStore((state) => state.user?.email ?? '');
  const logout = useAuthStore((state) => state.logout);

  const displayName = useUserProfileStore((state) => state.displayName);
  const email = useUserProfileStore((state) => state.email);
  const avatarUri = useUserProfileStore((state) => state.avatarUri);
  const partiesInterest = useUserProfileStore((state) => state.partiesInterest);
  const statesInterest = useUserProfileStore((state) => state.statesInterest);
  const monitoringCount = useUserProfileStore((state) => state.monitoringCount);
  const alertsEnabled = useUserProfileStore((state) => state.alertsEnabled);
  const biometricEnabled = useUserProfileStore((state) => state.biometricEnabled);

  const setDisplayName = useUserProfileStore((state) => state.setDisplayName);
  const setEmail = useUserProfileStore((state) => state.setEmail);
  const setAvatarUri = useUserProfileStore((state) => state.setAvatarUri);
  const setPartiesInterest = useUserProfileStore((state) => state.setPartiesInterest);
  const setStatesInterest = useUserProfileStore((state) => state.setStatesInterest);
  const setAlertsEnabled = useUserProfileStore((state) => state.setAlertsEnabled);
  const setBiometricEnabled = useUserProfileStore((state) => state.setBiometricEnabled);

  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [saving, setSaving] = useState(false);

  const [nameDraft, setNameDraft] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const [partyQuery, setPartyQuery] = useState('');
  const [partiesDraft, setPartiesDraft] = useState<string[]>([]);
  const [statesDraft, setStatesDraft] = useState<string[]>([]);

  useEffect(() => {
    if (authName && (displayName === 'João Silva' || !displayName.trim())) {
      setDisplayName(authName);
    }
  }, [authName, displayName, setDisplayName]);

  useEffect(() => {
    if (authEmail && (email === 'joao@email.com' || !email.trim())) {
      setEmail(authEmail);
    }
  }, [authEmail, email, setEmail]);

  const partyOptions = useMemo(() => {
    const merged = [...PARTY_OPTIONS_BASE, ...partiesInterest.map((p) => p.toUpperCase())];
    return Array.from(new Set(merged));
  }, [partiesInterest]);

  const filteredPartyOptions = useMemo(() => {
    const q = partyQuery.trim().toLowerCase();
    if (!q) {
      return partyOptions;
    }
    return partyOptions.filter((item) => item.toLowerCase().includes(q));
  }, [partyOptions, partyQuery]);

  const displayStates = useMemo(() => asChipSummary(statesInterest, (uf) => `${UF_NAMES[uf] ?? uf} (${uf})`), [statesInterest]);
  const displayParties = useMemo(() => asChipSummary(partiesInterest), [partiesInterest]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setNameError(null);
    setPartyQuery('');
  }, []);

  const openNameModal = useCallback(() => {
    setNameDraft(displayName);
    setNameError(null);
    setActiveModal('name');
  }, [displayName]);

  const openPartiesModal = useCallback(() => {
    setPartiesDraft(partiesInterest);
    setPartyQuery('');
    setActiveModal('parties');
  }, [partiesInterest]);

  const openStatesModal = useCallback(() => {
    setStatesDraft(statesInterest);
    setActiveModal('states');
  }, [statesInterest]);

  const onSaveName = useCallback(() => {
    const normalized = nameDraft.trim().replace(/\s+/g, ' ');
    if (normalized.length < 2) {
      setNameError('Informe um nome com ao menos 2 caracteres.');
      return;
    }
    setDisplayName(normalized);
    closeModal();
  }, [closeModal, nameDraft, setDisplayName]);

  const toggleParty = useCallback((party: string) => {
    setPartiesDraft((prev) => (prev.includes(party) ? prev.filter((item) => item !== party) : [...prev, party]));
  }, []);

  const toggleState = useCallback((uf: string) => {
    setStatesDraft((prev) => (prev.includes(uf) ? prev.filter((item) => item !== uf) : [...prev, uf]));
  }, []);

  const onSaveParties = useCallback(() => {
    setPartiesInterest(partiesDraft);
    closeModal();
  }, [closeModal, partiesDraft, setPartiesInterest]);

  const onSaveStates = useCallback(() => {
    setStatesInterest(statesDraft);
    closeModal();
  }, [closeModal, setStatesInterest, statesDraft]);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      Alert.alert('Preferências salvas', 'As configurações do seu perfil foram atualizadas.');
    } finally {
      setSaving(false);
    }
  }, []);

  const onSelectTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    closeModal();
  }, [closeModal, setThemeMode]);

  const onThemeAutoToggle = useCallback((enabled: boolean) => {
    setThemeMode(enabled ? 'system' : 'dark');
  }, [setThemeMode]);

  const onThemeManualToggle = useCallback((enabledDark: boolean) => {
    setThemeMode(enabledDark ? 'dark' : 'light');
  }, [setThemeMode]);

  const onPickImage = useCallback(async (source: 'camera' | 'library') => {
    if (!hasImagePickerSupport()) {
      Alert.alert('Recurso indisponível', 'Instale expo-image-picker para habilitar seleção de foto.');
      return;
    }

    const uri = source === 'camera'
      ? await takePhotoWithCamera()
      : await pickImageFromLibrary();

    if (!uri) {
      Alert.alert('Sem alteração', 'Não foi possível obter uma imagem. Verifique permissões e tente novamente.');
      return;
    }

    setAvatarUri(uri);
    closeModal();
  }, [closeModal, setAvatarUri]);

  const themeLabel = themeMode === 'system' ? 'Automático' : themeMode === 'dark' ? 'Escuro' : 'Claro';

  return (
    <ScreenBackground includeBottomInset={false}>
      <View style={[styles.topBar, { paddingTop: insets.top > 0 ? 6 : 12 }]}> 
        <Pressable style={styles.topAction} onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}>
          <Icon name="chevron-left" size={18} color="#23D565" />
          <AppText weight="bold" style={styles.topActionText}>Voltar</AppText>
        </Pressable>

        <AppText weight="bold" style={styles.topTitle}>Perfil</AppText>

        <Pressable style={styles.topAction} onPress={() => void onSave()}>
          <AppText weight="bold" style={styles.topActionText}>{saving ? 'Salvando...' : 'Salvar'}</AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={displayName}
          subtitle={`Monitorando ${monitoringCount} políticos ativamente`}
          avatarUri={avatarUri}
          onPressAvatar={() => setActiveModal('avatar')}
        />

        <ProfileSectionTitle title="Dados pessoais" />
        <ProfileCard>
          <ProfileRow icon="account-outline" label="Nome Completo" value={displayName} showChevron onPress={openNameModal} />
          <ProfileRow icon="email-outline" label="E-mail" value={email} showChevron />
        </ProfileCard>

        <ProfileSectionTitle title="Preferências de monitoramento" />
        <ProfileCard>
          <ProfileRow
            icon="account-group-outline"
            label="Partidos de Interesse"
            value=""
            onPress={openPartiesModal}
            rightNode={(
              <Pressable onPress={openPartiesModal} hitSlop={8}>
                <Icon name="plus" size={18} color="#8FE9A8" />
              </Pressable>
            )}
          />
          <ProfileChips items={displayParties} />

          <ProfileRow icon="map-marker-outline" label="Estados (UF)" value="" onPress={openStatesModal} />
          <ProfileChips items={displayStates} />

          <ProfileToggleRow
            icon="bell-ring-outline"
            label="Alertas de Gastos"
            value={alertsEnabled}
            onValueChange={setAlertsEnabled}
          />

          <ProfileRow icon="theme-light-dark" label="Tema" value={themeLabel} showChevron onPress={() => setActiveModal('theme')} />
          <AppText style={styles.helperText}>Por padrão, o app segue o tema do dispositivo automaticamente.</AppText>

          <ProfileToggleRow
            icon="cellphone-cog"
            label="Seguir tema do sistema"
            value={themeMode === 'system'}
            onValueChange={onThemeAutoToggle}
          />

          <ProfileToggleRow
            icon="weather-night"
            label="Modo escuro (manual)"
            value={themeMode === 'dark'}
            onValueChange={onThemeManualToggle}
          />
        </ProfileCard>

        <ProfileSectionTitle title="Segurança" />
        <ProfileCard>
          <ProfileRow icon="lock-outline" label="Alterar Senha" showChevron />
          <ProfileToggleRow
            icon="fingerprint"
            label="Biometria / Face ID"
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
          />
        </ProfileCard>

        <LogoutButton onPress={() => void logout()} />
        <AppText style={styles.version}>TRANSPARÊNCIA PÚBLICA V2.4.0</AppText>
      </ScrollView>

      <Modal transparent visible={activeModal === 'avatar'} animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <AppText weight="bold" style={styles.sheetTitle}>Foto de perfil</AppText>
            <Pressable style={styles.sheetOption} onPress={() => void onPickImage('camera')}><AppText style={styles.sheetText}>Tirar foto</AppText></Pressable>
            <Pressable style={styles.sheetOption} onPress={() => void onPickImage('library')}><AppText style={styles.sheetText}>Escolher da galeria</AppText></Pressable>
            <Pressable style={[styles.sheetOption, styles.sheetCancel]} onPress={closeModal}><AppText style={styles.sheetCancelText}>Cancelar</AppText></Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={activeModal === 'name'} animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <AppText weight="bold" style={styles.sheetTitle}>Editar nome</AppText>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Digite seu nome"
              placeholderTextColor="#6D877A"
              style={styles.input}
              autoCapitalize="words"
            />
            {nameError ? <AppText style={styles.errorText}>{nameError}</AppText> : null}
            <View style={styles.modalActions}>
              <Pressable style={styles.actionButtonGhost} onPress={closeModal}><AppText style={styles.actionGhostText}>Cancelar</AppText></Pressable>
              <Pressable style={styles.actionButton} onPress={onSaveName}><AppText weight="bold" style={styles.actionText}>Salvar</AppText></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={activeModal === 'parties'} animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalLarge} onPress={() => undefined}>
            <AppText weight="bold" style={styles.sheetTitle}>Partidos de interesse</AppText>
            <TextInput
              value={partyQuery}
              onChangeText={setPartyQuery}
              placeholder="Buscar partido"
              placeholderTextColor="#6D877A"
              style={styles.input}
            />
            <ScrollView style={styles.listArea}>
              {filteredPartyOptions.map((party) => {
                const selected = partiesDraft.includes(party);
                return (
                  <Pressable key={party} style={styles.selectRow} onPress={() => toggleParty(party)}>
                    <AppText style={styles.selectLabel}>{party}</AppText>
                    <Icon name={selected ? 'check-circle' : 'checkbox-blank-circle-outline'} size={20} color={selected ? '#1FD867' : '#5E786A'} />
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.actionButtonGhost} onPress={() => setPartiesDraft([])}><AppText style={styles.actionGhostText}>Limpar</AppText></Pressable>
              <Pressable style={styles.actionButton} onPress={onSaveParties}><AppText weight="bold" style={styles.actionText}>Salvar</AppText></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={activeModal === 'states'} animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalLarge} onPress={() => undefined}>
            <AppText weight="bold" style={styles.sheetTitle}>Estados (UF)</AppText>
            <ScrollView style={styles.listArea}>
              {BRAZIL_UFS.map((uf) => {
                const selected = statesDraft.includes(uf);
                return (
                  <Pressable key={uf} style={styles.selectRow} onPress={() => toggleState(uf)}>
                    <AppText style={styles.selectLabel}>{UF_NAMES[uf]} ({uf})</AppText>
                    <Icon name={selected ? 'check-circle' : 'checkbox-blank-circle-outline'} size={20} color={selected ? '#1FD867' : '#5E786A'} />
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.actionButtonGhost} onPress={() => setStatesDraft([])}><AppText style={styles.actionGhostText}>Limpar</AppText></Pressable>
              <Pressable style={styles.actionButton} onPress={onSaveStates}><AppText weight="bold" style={styles.actionText}>Salvar</AppText></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={activeModal === 'theme'} animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <AppText weight="bold" style={styles.sheetTitle}>Tema do app</AppText>
            {(['system', 'dark', 'light'] as ThemeMode[]).map((mode) => {
              const label = mode === 'system' ? 'Sistema (Automático)' : mode === 'dark' ? 'Escuro' : 'Claro';
              const selected = themeMode === mode;
              return (
                <Pressable key={mode} style={styles.selectRow} onPress={() => onSelectTheme(mode)}>
                  <AppText style={styles.selectLabel}>{label}</AppText>
                  <Icon name={selected ? 'radiobox-marked' : 'radiobox-blank'} size={20} color={selected ? '#1FD867' : '#5E786A'} />
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  topBar: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(130, 181, 147, 0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  topAction: {
    minWidth: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  topActionText: {
    color: '#23D565',
    fontSize: 15,
    lineHeight: 19,
  },
  topTitle: {
    color: '#EDF8F1',
    fontSize: 23,
    lineHeight: 29,
  },
  content: {
    paddingHorizontal: 12,
  },
  helperText: {
    color: '#8CA499',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 8,
  },
  version: {
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
    color: '#6A8275',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  sheet: {
    backgroundColor: '#132A1F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(130, 181, 147, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  modalCard: {
    backgroundColor: '#132A1F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(130, 181, 147, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  modalLarge: {
    backgroundColor: '#132A1F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(130, 181, 147, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    maxHeight: '78%',
  },
  sheetTitle: {
    color: '#E9F5ED',
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 8,
  },
  sheetOption: {
    minHeight: 46,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(130, 181, 147, 0.12)',
  },
  sheetText: {
    color: '#D8ECE0',
    fontSize: 15,
    lineHeight: 19,
  },
  sheetCancel: {
    borderBottomWidth: 0,
  },
  sheetCancelText: {
    color: '#F19D9D',
    fontSize: 15,
    lineHeight: 19,
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(130, 181, 147, 0.18)',
    backgroundColor: '#193628',
    color: '#E8F4EC',
    fontSize: 15,
    lineHeight: 19,
    includeFontPadding: false,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#FF9F9F',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButtonGhost: {
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#203D2E',
  },
  actionGhostText: {
    color: '#C9DDD1',
    fontSize: 14,
    lineHeight: 18,
  },
  actionButton: {
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22D663',
  },
  actionText: {
    color: '#103121',
    fontSize: 14,
    lineHeight: 18,
  },
  listArea: {
    maxHeight: 330,
    marginTop: 4,
  },
  selectRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(130, 181, 147, 0.1)',
  },
  selectLabel: {
    color: '#E1F0E7',
    fontSize: 14,
    lineHeight: 18,
  },
});
