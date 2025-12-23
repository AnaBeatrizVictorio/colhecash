import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api from './api';

console.log('📦 Módulos carregados (legacy API)');
console.log('  FileSystem:', !!FileSystem);
console.log('  Sharing:', !!Sharing);
console.log('  documentDirectory:', FileSystem.documentDirectory);

export const gerarRelatorioPDF = async (mes, ano) => {
  try {
    console.log('📄 Iniciando geração de PDF...', { mes, ano });

    const response = await api.post('/relatorios/gerar-pdf', { mes, ano });

    if (!response.data?.success) {
      throw new Error('Backend não retornou sucesso');
    }

    const { base64, nomeArquivo } = response.data;
    const fileUri = FileSystem.documentDirectory + nomeArquivo;
    
    console.log('💾 Salvando PDF em:', fileUri);

    // Usar API legada do FileSystem
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64
    });

    console.log('✅ PDF salvo com sucesso');

    // Compartilhar
    const canShare = await Sharing.isAvailableAsync();
    console.log('📤 Pode compartilhar?', canShare);
    
    if (canShare) {
      console.log('📤 Compartilhando PDF...');
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Salvar Relatório PDF'
      });
      console.log('✅ Compartilhamento concluído');
    }

    return { success: true, fileUri };
  } catch (error) {
    console.error('❌ Erro PDF:', error.message);
    throw error;
  }
};

export const gerarRelatorioExcel = async (mes, ano) => {
  try {
    console.log('📊 Iniciando geração de Excel...', { mes, ano });

    const response = await api.post('/relatorios/gerar-excel', { mes, ano });

    if (!response.data?.success) {
      throw new Error('Backend não retornou sucesso');
    }

    const { base64, nomeArquivo } = response.data;
    const fileUri = FileSystem.documentDirectory + nomeArquivo;
    
    console.log('💾 Salvando Excel em:', fileUri);

    // Usar API legada do FileSystem
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64
    });

    console.log('✅ Excel salvo com sucesso');

    // Compartilhar
    const canShare = await Sharing.isAvailableAsync();
    console.log('📤 Pode compartilhar?', canShare);
    
    if (canShare) {
      console.log('📤 Compartilhando Excel...');
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Salvar Relatório Excel'
      });
      console.log('✅ Compartilhamento concluído');
    }

    return { success: true, fileUri };
  } catch (error) {
    console.error('❌ Erro Excel:', error.message);
    throw error;
  }
};
