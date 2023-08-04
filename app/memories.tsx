import {
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Text,
  Button,
} from 'react-native'
import NLWLogo from '../src/assets/nlwLogo.svg'
import { Link, useRouter, usePathname } from 'expo-router'
import Icon from '@expo/vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useRef, useState } from 'react'
import { api } from '../src/lib/api'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import { ResizeMode, Video } from 'expo-av'
dayjs.locale(ptBr)

interface Memory {
  coverUrl: string
  excerpt: string
  id: string
  createdAt: string
  ref: any
}

export default function Memories() {
  const { bottom, top } = useSafeAreaInsets()
  const router = useRouter()
  const path = usePathname()
  const [memories, setMemories] = useState<Memory[]>([])
  async function signOut() {
    await SecureStore.deleteItemAsync('token')
    router.push('/')
  }

  async function loadMemories() {
    const token = await SecureStore.getItemAsync('token')
    const response = await api.get('/memories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = response.data.sort((memory: Memory) => {
      return (
        new Date(memory.createdAt).getTime() -
        new Date(memory.createdAt).getTime()
      )
    })

    setMemories(result)
  }

  const videoRefs = useRef([])
  const [statuses, setStatuses] = useState([])

  useEffect(() => {
    if (path === '/memories') {
      loadMemories()
      videoRefs.current = videoRefs.current.slice(0, memories.length)
      setStatuses(videoRefs.current.map(() => ({})))
    }
  }, [path])

  const handlePlaybackStatusUpdate = (index, status) => {
    setStatuses((prevStatuses) => {
      const newStatuses = [...prevStatuses]
      newStatuses[index] = status
      return newStatuses
    })
  }

  const handlePlayPause = (index) => {
    if (statuses[index].isPlaying) {
      videoRefs.current[index].pauseAsync()
    } else {
      videoRefs.current[index].playAsync()
    }
  }

  return (
    <ScrollView
      className="mb-2"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-5 flex-row items-center justify-between px-8">
        <NLWLogo />

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={signOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Icon name="log-out" size={16} color="#000" />
          </TouchableOpacity>
          <Link href="/newMemory" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      <View className="mt-6 space-y-10">
        {memories.length > 0 &&
          memories.map((memory, index) => (
            <View key={memory.id} className="space-y-4">
              <View className="flex-row items-center gap-2">
                <View className="h-px w-5 bg-gray-50"></View>
                <Text className="font-body text-sm text-gray-100">
                  {dayjs(memory.createdAt).format('D [de] MMMM[,] YYYY')}
                </Text>
              </View>
              <View className="space-y-4 px-8">
                {/* <Image
                  source={{
                    uri: memory.coverUrl,
                  }}
                  className="aspect-video w-full rounded-lg"
                  alt=""
                /> */}
                <Video
                  ref={(ref) => (videoRefs.current[index] = ref)}
                  source={{
                    uri: memory.coverUrl,
                  }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  className="aspect-square w-full rounded-lg"
                  // onPlaybackStatusUpdate={(status) =>
                  //   handlePlaybackStatusUpdate(index, status)
                  // }
                />
                {/* <View>
                  <Button
                    title={statuses[index].isPlaying ? 'Pause' : 'Play'}
                    onPress={() => handlePlayPause(index)}
                  />
                </View> */}
                <Text className="font-body text-base leading-relaxed text-gray-100">
                  {memory.excerpt}
                </Text>
                <Link href={`/memories/${memory.id}`}>
                  <TouchableOpacity className="flex-row items-center space-x-2">
                    <Text className="font-body text-sm text-gray-200">
                      Ler mais
                    </Text>
                    <Icon name="arrow-right" size={16} color="#9e9ea0"></Icon>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  )
}
