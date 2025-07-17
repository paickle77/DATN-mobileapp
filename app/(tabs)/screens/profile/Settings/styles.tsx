import { StyleSheet } from 'react-native';


// Styles cho toàn bộ component
export const styles = StyleSheet.create({
  
   container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header Styles
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
  headerContent: {
    alignItems: 'center',
  },
  
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerSpacer: {
    width: 40,
  },
  
headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    flex: 1,
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: 'black',
    opacity: 0.8,
  },
  
  // ScrollView Styles
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  
 
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
  
  // Menu Styles
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    marginTop: 20,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 5,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  
  menuContent: {
    flex: 1,
  },
  
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  
  menuSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  
  // App Info Styles
  appInfo: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 20,
  },
  
  appVersion: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  
  appCopyright: {
    fontSize: 12,
    color: '#999999',
  },
    
   
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
   
    menuIcon: {
        width: 32,
        alignItems: 'center',
        marginRight: 12,
    },
   
    chevron: {
        marginLeft: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
    },
    formContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    primaryButton: {
        backgroundColor: '#50C878',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    securityDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    warningContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#fff5f5',
        borderWidth: 1,
        borderColor: '#fed7d7',
        borderRadius: 12,
        alignItems: 'center',
    },
    warningTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginTop: 8,
        marginBottom: 12,
    },
    warningText: {
        fontSize: 14,
        color: '#744210',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 20,
    },
    warningList: {
        fontSize: 14,
        color: '#744210',
        lineHeight: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
        marginBottom: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#FF6B6B',
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#FF6B6B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    dangerButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    dangerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: 320,
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingTop: 18,
        paddingBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 10,
        color: '#222',
    },
    modalDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 18,
    },
    modalText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
    },
    modalButton: {
        flex: 1,
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#eee',
        marginRight: 10,
    },
    confirmButton: {
        backgroundColor: '#FF6B6B',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 15,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
 inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  marginBottom: 16,
  paddingHorizontal: 12,
  backgroundColor: '#fafafa',
},

input1: {
  flex: 1,
  height: 48,
  fontSize: 16,
  color: '#333',
},

eyeIcon: {
  paddingHorizontal: 6,
  paddingVertical: 6,
},
});